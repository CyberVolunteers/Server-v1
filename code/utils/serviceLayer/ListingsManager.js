const util = require("util");
const utils = require("../utils");

module.exports = class ListingsManager {
	constructor(pool, logger, listingsIndex){
		this.logger = logger;
		this.pool = pool;
		this.listingsIndex = listingsIndex;
	}

	async createListing(params) {
		const connection = await utils.getConnection(this.pool);
		const query = util.promisify(connection.query).bind(connection);

		console.log(params.charityId);
        
		try{
			await query("INSERT INTO `listings`(uuid, timeForVolunteering, placeForVolunteering, targetAudience, skills, requirements, opportunityDesc, opportunityCategory, opportunityTitle, numOfvolunteers, minHoursPerWeek, maxHoursPerWeek, duration, charityId, createdDate) VALUES (uuid(), ?,?,?,?,?,?,?,?,?,?,?,?,?,UNIX_TIMESTAMP());", [params.timeForVolunteering, params.placeForVolunteering, this.createTargetAudienceString(params.targetAudience), params.skills, params.requirements, params.opportunityDesc, params.opportunityCategory, params.opportunityTitle, params.numOfvolunteers, params.minHoursPerWeek, params.maxHoursPerWeek, params.duration, params.charityId]);
			const queryResults = await query("SELECT LAST_INSERT_ID();");
			const valueString = params.opportunityDesc + " " + params.opportunityCategory + " " + params.opportunityTitle;
			this.listingsIndex.add(queryResults[0]["LAST_INSERT_ID()"], valueString);
		}finally{
			connection.release();
		}
	}

	async searchListings(params) {
		const connection = await utils.getConnection(this.pool);
		const query = util.promisify(connection.query).bind(connection);
        
		try{
			let searchQuery = "";
			for(let term of params.terms){
				searchQuery += term.toLowerCase() + " ";
			}

			const results = await this.listingsIndex.search({
				query: searchQuery,
				suggest: true
			});

			const listingsData = await query("SELECT uuid, timeForVolunteering, placeForVolunteering, targetAudience, skills, requirements, opportunityDesc, opportunityCategory, opportunityTitle, numOfvolunteers, minHoursPerWeek, maxHoursPerWeek, createdDate FROM listings WHERE id IN (?)", [results]);
			return listingsData;
		}finally{
			connection.release();
		}
	}

	createTargetAudienceString(selectedOptions){
		const audiences = ["teens", "people aged 18-55", "people over 55"];

		let selectedAudiences = [];
		for(let selectedOption of selectedOptions){
			if(audiences[Number(selectedOption)] !== undefined){
				selectedAudiences.push(audiences[Number(selectedOption)]);
			}
		}

		const output =  selectedAudiences.join(", ");

		if(output === ""){
			return "everyone";
		}else{
			return output;
		}
	}
};