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
    }

    async sendConfirmationEmail(email){
        const connection = await utils.getConnection(this.pool);
        const query = util.promisify(connection.query).bind(connection);

        try{
            const rows = await query("SELECT isEmailVerified FROM volunteers WHERE email=? AND isEmailVerified=0", [email]);

            if(rows[0] === undefined) return "Email not found or it has been verified already";

            //generate a random string
            const uuid = uuidv4();

            //set it
            const success = emailsVerificationTokensCache.set(email, uuid);

            if(!success) throw new Error("Failed to set a key for email verification");

            const info = await this.transporter.sendMail({
                from: settings.botEmailAddress,
                to: email,
                subject: "Please, verify your email address",
                text: this.confirmEmailTextTemplate({"link": "http://127.0.0.1:1234/verifyEmailToken?uuid=" + uuid + "&email=" + email}),
                html: this.confirmEmailHTMLTemplate({"link": "http://127.0.0.1:1234/verifyEmailToken?uuid=" + uuid + "&email=" + email}),
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