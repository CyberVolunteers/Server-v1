const util = require("util");
const utils = require("../utils");

module.exports = class ListingsManager {
    constructor(pool, logger){
        this.logger = logger;
        this.pool = pool;
    }

    async createListing(params) {
        //TODO: check if the requesting party is a company or a person
        const connection = await utils.getConnection(this.pool);
        const query = util.promisify(connection.query).bind(connection);
        
        try{
            await query("INSERT INTO `listings`(id, timeRequirements, timeForVolunteering, placeForVolunteering, targetAudience, skills, requirements, opportunityDesc, opportunityCategory, opportunityTitle, numOfvolunteers, minHoursPerWeek, maxHoursPerWeek, createdDate) VALUES (uuid(), ?,?,?,?,?,?,?,?,?,?,?,?,UNIX_TIMESTAMP());", [params.timeRequirements, params.timeForVolunteering, params.placeForVolunteering, params.targetAudience, params.skills, params.requirements, params.opportunityDesc, params.opportunityCategory, params.opportunityTitle, params.numOfvolunteers, params.minHoursPerWeek, params.maxHoursPerWeek]);
        }catch (err) {
            throw err;
        }finally{
            connection.release();
        }
    }
}