const util = require("util");
const utils = require("../utils");
const settings = require("../../settings");

const {v4: uuidv4} = require('uuid');

const NodeCache = require("node-cache");
const emailsVerificationTokensCache = new NodeCache({stdTTL: settings.emailVerificationTime, checkperiod: settings.emailVerificationTime/2});

const fs = require("fs");

const nodemailer = require("nodemailer");
const Handlebars = require("handlebars");
const secureCompare = require("secure-compare");
const { error } = require("../winston");


module.exports = class NodemailerManager{
    constructor(pool, logger){
        this.logger = logger;
        this.pool = pool;


        this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: "zua5w3gpzvpz52mx@ethereal.email",
                pass: "xHwKvsu3chdWD6kk9x"
            }
        });

        this.confirmEmailTextTemplate = Handlebars.compile(fs.readFileSync("./public/emails/confirmEmail.txt", "utf8"));

        this.confirmEmailHTMLTemplate = Handlebars.compile(fs.readFileSync("./public/emails/confirmEmail.hbs", "utf8"));

        this.volunteerHelpOfferEmailTextTemplate = Handlebars.compile(fs.readFileSync("./public/emails/volunteerHelpOfferEmail.txt", "utf8"));

        this.volunteerHelpOfferEmailHTMLTemplate = Handlebars.compile(fs.readFileSync("./public/emails/volunteerHelpOfferEmail.hbs", "utf8"));
    }

    processInfoForVolunteerHelpOfferEmail(rowInfo, templateInfo){
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
        rowInfo.age = Math.floor((Date.now()-rowInfo.birthDate)/ 1000 / 60 / 60 / 24 / 365.25);

        //convert seconds to milliseconds and create a new date object
        const dateCreationOptions = {year: "numeric", month: "long", day: "numeric"};
        rowInfo.createdDate = new Date(rowInfo.createdDate * 1000).toLocaleDateString("en-UK", dateCreationOptions);

        // add the data to the entries
        templateInfo.entries.push(rowInfo);

        return rowInfo;
    }

    async sendVolunteerHelpOfferEmail(volunteers_listingsIds){
        const connection = await utils.getConnection(this.pool);
        const query = util.promisify(connection.query).bind(connection);

        try{
            const rows = await query("SELECT listings.opportunityTitle, listings.createdDate, volunteers.firstName, volunteers.lastName, volunteers.email, volunteers.phoneNumber, volunteers.address, volunteers.nationality, volunteers.occupation, volunteers.linkedIn, volunteers.gender, volunteers.birthDate FROM volunteers_listings INNER JOIN volunteers ON volunteers.id=volunteers_listings.volunteerId INNER JOIN listings ON listings.id=listingId WHERE volunteers_listings.id IN (?)", [volunteers_listingsIds]);

            if(rows.length == 0) throw new Error("Can not find this listing");

            let templateInfo = {
                entries: []
            };
            for(let i = 0; i < rows.length; i++){
                this.processInfoForVolunteerHelpOfferEmail(rows[i], templateInfo);
            }

            const info = await this.transporter.sendMail({
                from: settings.botEmailAddress,
                to: "email@email.com",
                subject: "Someone has applied to your listing",
                text: this.volunteerHelpOfferEmailTextTemplate(templateInfo),
                html: this.volunteerHelpOfferEmailHTMLTemplate(templateInfo),
            });

            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }catch(err){
            throw err;
        }finally{
            connection.release();
        }
    }

    async sendConfirmationEmail(email){
        const connection = await utils.getConnection(this.pool);
        const query = util.promisify(connection.query).bind(connection);

        try{
            const rows = await query("SELECT * FROM volunteers WHERE email=? AND isEmailVerified=0", [email]);
            if(rows[0] === undefined) return "Email not found or it has been verified already";

            //generate a random string
            const uuid = uuidv4();

            //set it
            const success = emailsVerificationTokensCache.set(email, uuid);

            if(!success) throw new Error("Failed to set a key for email verification");

            const templateInfo = {
                "link": "http://127.0.0.1:1234/verifyEmailToken?uuid=" + uuid + "&email=" + email,
                "firstName": rows[0].firstName,
                "lastName": rows[0].lastName
            }

            const info = await this.transporter.sendMail({
                from: settings.botEmailAddress,
                to: email,
                subject: "Please, verify your email address",
                text: this.confirmEmailTextTemplate(templateInfo),
                html: this.confirmEmailHTMLTemplate(templateInfo),
            });

            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

            return true;
        }catch(err){
            throw err;
        }finally{
            connection.release();
        }
    }

    async verifyEmailToken(email, uuid){
        const connection = await utils.getConnection(this.pool);
        const query = util.promisify(connection.query).bind(connection);

        try{

            const uuidRetreived = emailsVerificationTokensCache.get(email);

            //prevent timing attacks
            if(uuidRetreived == undefined){
                secureCompare(uuid, "84f3df83-3bb8-4d90-8ea4-c4c7af2aa0d4");
                return false;
            }

            const result =  secureCompare(uuid, uuidRetreived);
            if(result == true){
                await query("UPDATE volunteers SET isEmailVerified=1 WHERE email=?", [email]);
            }

            return result;
        }catch(err){
            throw err;
        }finally{
            connection.release();
        }
    }

    async applyForListing(params){
        const connection = await utils.getConnection(this.pool);
        const query = util.promisify(connection.query).bind(connection);

        try{
            //get listing id
            let results = await query("SELECT id FROM listings WHERE uuid=?", [params.listingUUID]);

            if(results.length == 0){
                return "Bad data";
            }

            const listingId = results[0].id;

            //check if a user has already signed up for the listing
            results = await query("SELECT * FROM volunteers_listings WHERE volunteerId=? AND listingId=?", [params.volunteerId, listingId]);

            if(results.length != 0){
                return "You have already applied to this listing";
            }

            await query("INSERT INTO volunteers_listings(volunteerId, listingId, isConfirmed, appliedDate) VALUES(?, ?, ?, UNIX_TIMESTAMP())", [params.volunteerId, listingId, 0]);

            //TODO: send email?
        }catch(err){
            throw err;
        }finally{
            connection.release();
        }
    }
}