const util = require("util");
const utils = require("../utils");
const settings = require("../../settings");

const {v4: uuidv4} = require('uuid');

const NodeCache = require("node-cache");
const emailsVerificationTokensCache = new NodeCache({stdTTL: settings.emailVerificationTime, checkperiod: settings.emailVerificationTime/2});

const fs = require("fs");

const nodemailer = require("nodemailer");
const Handlebars = require("handlebars");


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

        this.confirmEmailTextTemplate = Handlebars.compile(fs.readFileSync("./emails/confirmEmail.txt", "utf8"));

        this.confirmEmailHTMLTemplate = Handlebars.compile(fs.readFileSync("./emails/confirmEmail.hbs", "utf8"));

        this.sendConfirmationEmail("ree@eee.com");
    }

    async sendConfirmationEmail(email){

        //generate a random string
        const uuid = uuidv4();

        //set it
        const success = emailsVerificationTokensCache.set(email, uuid);

        if(!success) throw new Error("Failed to set a key for email verification");

        const info = await this.transporter.sendMail({
            from: settings.botEmailAddress,
            to: email,
            subject: "Please, verify your email address",
            text: this.confirmEmailTextTemplate({"link": "http://example.com?uuid=" + uuid}),
            html: this.confirmEmailHTMLTemplate({"link": "http://example.com?uuid=" + uuid}),
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
}