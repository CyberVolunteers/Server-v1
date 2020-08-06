
const util = require("util");
const bcrypt = require("bcrypt");
const settings = require("../../settings");
const utils = require("../utils");

module.exports = class UserManager {
    constructor(pool, logger){
        this.logger = logger;
        this.pool = pool;
    }

    async localPassportVerify (email, password, done) {
        const badCredentialsMessage = "We could not find a user with this username and password.";

        try{
            const query = util.promisify(this.pool.query).bind(this.pool);
            // find the password hash by the email
            const results = await query("SELECT * FROM `volunteers` WHERE `email`=?;", [email]);
            if(results.length == 0){
                //compare a dummy password to prevent timing attacks
                await bcrypt.compare("a dummy password", "$2b$12$6VcZHuw9wxuspyuTio3Yd.E1Il2rwwGzzRDiaffcucukfvNW7r4rC");
                return done(null, false, {message: badCredentialsMessage});
            //actual check
            }else if (results.length == 1){
                const result = await bcrypt.compare(password, results[0].passwordHash);
                
                if(result === true){
                    //log in
                    return done(null, results[0]);
                }else{
                    //has not been authenticated
                    return done(null, false, {message: badCredentialsMessage});
                }
            }
        }catch(err){
            return done(err);
        }
    }

    async signUp (params){
        //get connection
		const connection = await utils.getConnection(this.pool);
        const query = util.promisify(connection.query).bind(connection);

        try{
            // check if the email is already used
            const results = await query("SELECT `email` FROM `volunteers` WHERE `email`=?;", [params.email]);

            // if email is already used
            if(results.length != 0){
                this.logger.debug("Email already used");
                return {code: 400, message: "This email is already used"};
            }

            const hash = await bcrypt.hash(params.password, settings.bcryptRounds);
            // Store hash in your password DB.
            await query("INSERT INTO `volunteers`(firstName, lastName, email, passwordHash, gender, salutation, nationality, address, postcode, city, country, phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", [params.firstName, params.lastName, params.email, hash, params.gender, params.salutation, params.nationality, params.address, params.postcode, params.city, params.country, params.phoneNumber]);
            return {code: 200};
        }catch(err){
            this.logger.error("error on signup");
		    this.logger.error(err.stack);
		    return {code: 400, message: "Bad data"};
        }finally{
            connection.release();
        }
    }
}