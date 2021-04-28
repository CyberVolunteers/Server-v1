const util = require("util");
const utils = require("../utils");
const settings = require("../../settings");

const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const NodeCache = require("node-cache");
const emailsVerificationTokensCache = new NodeCache({
  stdTTL: settings.emailVerificationTime,
  checkperiod: settings.emailVerificationTime / 2,
});

const fs = require("fs");

const nodemailer = require("nodemailer");
const Handlebars = require("handlebars");
const secureCompare = require("secure-compare");
const aws = require("aws-sdk");

module.exports = class NodemailerManager {
  constructor(pool, logger, hostName) {
    this.logger = logger;
    this.pool = pool;
    this.hostName = hostName;
    this.randomCodes = {};

    // clean up the codes once in a while
    setInterval(() => {
      const maxDate = new Date().getTime() - settings.passwordResetCodeTimeout;
      for (let key of Object.keys(this.randomCodes)) {
        if (this.randomCodes[key].time < maxDate) delete this.randomCodes[key];
      }
    }, settings.passwordResetCodeTimeout * 1000);

    aws.config.loadFromPath("./data/awsConfig.json");

    this.transporter = nodemailer.createTransport({
      SES: new aws.SES({
        apiVersion: "2010-12-01",
      }),
    });

    this.resetPasswordTextTemplate = Handlebars.compile(
      fs.readFileSync("./public/emails/resetPasswordEmail.txt", "utf8")
    );

    this.resetPasswordHTMLTemplate = Handlebars.compile(
      fs.readFileSync("./public/emails/resetPasswordEmail.hbs", "utf8")
    );

    this.confirmEmailTextTemplate = Handlebars.compile(
      fs.readFileSync("./public/emails/confirmEmail.txt", "utf8")
    );

    this.confirmEmailHTMLTemplate = Handlebars.compile(
      fs.readFileSync("./public/emails/confirmEmail.hbs", "utf8")
    );

    this.volunteerHelpOfferEmailTextTemplate = Handlebars.compile(
      fs.readFileSync("./public/emails/volunteerHelpOfferEmail.txt", "utf8")
    );

    this.volunteerHelpOfferEmailHTMLTemplate = Handlebars.compile(
      fs.readFileSync("./public/emails/volunteerHelpOfferEmail.hbs", "utf8")
    );
  }

  processInfoForVolunteerHelpOfferEmail(rowInfo, templateInfo) {
    switch (rowInfo.gender) {
      case "m":
        rowInfo.gender = "male";
        break;
      case "f":
        rowInfo.gender = "female";
        break;
      case "o":
        rowInfo.gender = "other";
        break;
    }

    //get the difference, convert it to years, and floor it
    rowInfo.age = Math.floor(
      (Date.now() - rowInfo.birthDate) / 1000 / 60 / 60 / 24 / 365.25
    );

    //convert seconds to milliseconds and create a new date object
    const dateCreationOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    rowInfo.createdDate = new Date(
      rowInfo.createdDate * 1000
    ).toLocaleDateString("en-UK", dateCreationOptions);

    // add the data to the entries
    templateInfo.entries.push(rowInfo);

    return rowInfo;
  }

  async sendVolunteerHelpOfferEmail(volunteers_listingsIds, email) {
    const connection = await utils.getConnection(this.pool);
    const query = util.promisify(connection.query).bind(connection);

    try {
      const rows = await query(
        "SELECT listings.opportunityTitle, listings.createdDate, volunteers.firstName, volunteers.lastName, volunteers.email, volunteers.phoneNumber, volunteers.address, volunteers.nationality, volunteers.occupation, volunteers.linkedIn, volunteers.gender, volunteers.birthDate, volunteers.languages, volunteers.skillsAndInterests, listings.volunteersSignedUp FROM volunteers_listings INNER JOIN volunteers ON volunteers.id=volunteers_listings.volunteerId INNER JOIN listings ON listings.id=listingId WHERE volunteers_listings.id IN (?)",
        [volunteers_listingsIds]
      );

      if (rows.length == 0) throw new Error("Can not find this listing");

      let templateInfo = {
        entries: [],
      };
      for (let i = 0; i < rows.length; i++) {
        this.processInfoForVolunteerHelpOfferEmail(rows[i], templateInfo);
      }

      const info = await this.transporter.sendMail({
        from: settings.botEmailAddress,
        to: email,
        subject: "Someone has applied to your listing",
        text: this.volunteerHelpOfferEmailTextTemplate(templateInfo),
        html: this.volunteerHelpOfferEmailHTMLTemplate(templateInfo),
      });

      this.logger.info("sent an application email to '" + email + "'");
    } finally {
      connection.release();
    }
  }

  async sendConfirmationEmail(email, isVolunteer) {
    const connection = await utils.getConnection(this.pool);
    const query = util.promisify(connection.query).bind(connection);

    try {
      let rows;
      if (isVolunteer) {
        rows = await query(
          "SELECT * FROM volunteers WHERE email=? AND isEmailVerified=0",
          [email]
        );
      } else {
        rows = await query(
          "SELECT * FROM charities WHERE email=? AND isEmailVerified=0",
          [email]
        );
      }
      if (rows[0] === undefined)
        return "Email not found or it has been verified already";

      //generate a random string
      const uuid = uuidv4();

      //set it
      const success = emailsVerificationTokensCache.set(email, {
        uuid: uuid,
        isVolunteer: isVolunteer,
      });

      this.logger.info(
        `Setting cache, email: ${email}, uuid: ${uuid}, isVolunteer: ${isVolunteer}`
      );

      if (!success)
        throw new Error("Failed to set a key for email verification");

      const templateInfo = {
        link:
          this.hostName + "verifyEmailToken?uuid=" + uuid + "&email=" + email,
        firstName: rows[0].firstName,
        lastName: rows[0].lastName,
      };

      const info = await this.transporter.sendMail({
        from: settings.botEmailAddress,
        to: email,
        subject: "Please, verify your email address",
        text: this.confirmEmailTextTemplate(templateInfo),
        html: this.confirmEmailHTMLTemplate(templateInfo),
      });

      this.logger.info("sent a verification email to '" + email + "'");

      return true;
    } finally {
      connection.release();
    }
  }

  async verifyEmailToken(email, uuid) {
    const connection = await utils.getConnection(this.pool);
    const query = util.promisify(connection.query).bind(connection);

    try {
      const cachedObj = emailsVerificationTokensCache.get(email);
      this.logger.info(
        `Checking cache, email: ${email}, uuid: ${uuid}, isVolunteer: ${isVolunteer}`
      );

      //prevent timing attacks
      if (cachedObj == undefined) {
        secureCompare(uuid, "84f3df83-3bb8-4d90-8ea4-c4c7af2aa0d4");
        this.logger.info("No token for email verification");
        return false;
      }

      const uuidRetreived = cachedObj.uuid;
      const isVolunteer = cachedObj.isVolunteer;

      const result = secureCompare(uuid, uuidRetreived);
      if (result == true) {
        await query("START TRANSACTION;");
        if (isVolunteer) {
          await query("UPDATE volunteers SET isEmailVerified=1 WHERE email=?", [
            email,
          ]);
        } else {
          await query("UPDATE charities SET isEmailVerified=1 WHERE email=?", [
            email,
          ]);
        }
        await query("COMMIT;");
      } else {
        this.logger.info("Wrong token for email confirmation");
      }

      return result;
    } finally {
      connection.release();
    }
  }

  async applyForListing(params) {
    const connection = await utils.getConnection(this.pool);
    const query = util.promisify(connection.query).bind(connection);

    try {
      await query("START TRANSACTION;");
      //get listing id
      let results = await query(
        "SELECT id, charityId FROM listings WHERE uuid=?",
        [params.listingUUID]
      );

      if (results.length == 0) {
        return "Bad data";
      }

      const listingId = results[0].id;
      const charityId = results[0].charityId;

      //check if a user has already signed up for the listing
      results = await query(
        "SELECT * FROM volunteers_listings WHERE volunteerId=? AND listingId=?",
        [params.volunteerId, listingId]
      );

      if (results.length != 0) {
        await query("ROLLBACK;");
        return "You have already applied to this listing";
      }

      await query(
        "INSERT INTO volunteers_listings(volunteerId, listingId, isConfirmed, appliedDate) VALUES(?, ?, ?, UNIX_TIMESTAMP())",
        [params.volunteerId, listingId, 0]
      );
      await query(
        "UPDATE listings set volunteersSignedUp=volunteersSignedUp+1 WHERE id=?",
        [listingId]
      );

      //check if the charity wants to receive emails in groups
      results = await query(
        "SELECT sendHelpEmailsPeopleInGroups, email FROM charities WHERE id=?",
        [charityId]
      );

      const sendHelpEmailsPeopleInGroups =
        results[0].sendHelpEmailsPeopleInGroups;
      const email = results[0].email;

      if (!sendHelpEmailsPeopleInGroups) {
        results = await query("SELECT LAST_INSERT_ID()");
        const volunteers_listingsId = results[0]["LAST_INSERT_ID()"];
        this.sendVolunteerHelpOfferEmail([volunteers_listingsId], email);
      }
      await query("COMMIT;");
    } finally {
      connection.release();
    }
  }

  async sendBatchApplicationEmails() {
    const connection = await utils.getConnection(this.pool);
    const query = util.promisify(connection.query).bind(connection);

    const currentTime = new Date().getTime() / 1000;

    let emailsToSend = {};

    try {
      await query("START TRANSACTION;");

      const results = await query(
        "SELECT volunteers_listings.id, volunteers_listings.hasBeenSent, charities.email, charities.sendHelpEmailsPeopleInGroups, volunteers_listings.appliedDate FROM volunteers_listings INNER JOIN listings ON volunteers_listings.listingId=listings.id INNER JOIN charities ON listings.charityId=charities.id"
      );
      for (let i = 0; i < results.length; i++) {
        const row = results[i];
        //wait until the next tick
        await util.promisify(setImmediate)();
        const sendHelpEmailsPeopleInGroups =
          row.sendHelpEmailsPeopleInGroups === 1;
        const timePassed = currentTime - row.appliedDate;
        const hasBeenSent = row.hasBeenSent === 1;

        if (
          timePassed >= settings.emailBatchSendingTime &&
          sendHelpEmailsPeopleInGroups &&
          !hasBeenSent
        ) {
          if (emailsToSend[row.email] == undefined) {
            emailsToSend[row.email] = [];
          }
          emailsToSend[row.email].push(row.id);
        }
      }

      await query(
        "UPDATE volunteers_listings set hasBeenSent=1 where hasBeenSent=0"
      );

      //send the emails
      const keys = Object.keys(emailsToSend);
      for (const email of keys) {
        await util.promisify(setImmediate)();
        const ids = emailsToSend[email];
        this.sendVolunteerHelpOfferEmail(ids, email);
      }
      await query("COMMIT;");
    } finally {
      connection.release();
    }
  }

  async generateRandomPasswordResetCode(email) {
    const code = uuidv4();

    this.randomCodes[code] = {
      time: this.getCurrentTime(),
      email,
    };

    return code;
  }

  async sendPasswordResetCode(uuid, email, isVolunteer) {
    const connection = await utils.getConnection(this.pool);
    const query = util.promisify(connection.query).bind(connection);

    try {
      let rows;
      if (isVolunteer) {
        rows = await query("SELECT * FROM volunteers WHERE email=?", [email]);
      } else {
        rows = await query("SELECT * FROM charities WHERE email=?", [email]);
      }
      if (rows[0] === undefined) return false;

      const templateInfo = {
        link:
          this.hostName +
          "resetPassword?uuid=" +
          uuid +
          "&email=" +
          email +
          "&isVolunteer=" +
          isVolunteer,
        firstName: rows[0].firstName,
        lastName: rows[0].lastName,
      };

      const info = await this.transporter.sendMail({
        from: settings.botEmailAddress,
        to: email,
        subject: "Password reset",
        text: this.resetPasswordTextTemplate(templateInfo),
        html: this.resetPasswordHTMLTemplate(templateInfo),
      });

      this.logger.info("sent a verification email to '" + email + "'");
      return true;
    } finally {
      connection.release();
    }
  }

  checkPasswordResetCode(code, email) {
    const foundCode = this.randomCodes[code] !== undefined; // to prevent timing attacks
    const dataObj = foundCode ? this.randomCodes[code] : { time: 0, email: "" };

    const isTimeCorrect =
      dataObj.time + settings.passwordResetCodeTimeout > this.getCurrentTime();
    const isEmailCorrect = secureCompare(dataObj.email, email);

    console.log(foundCode, isTimeCorrect, isEmailCorrect);

    return foundCode && isTimeCorrect && isEmailCorrect;
  }

  removePasswordResetCode(code) {
    delete this.randomCodes[code];
  }

  getCurrentTime() {
    return new Date().getTime() / 1000;
  }
};
