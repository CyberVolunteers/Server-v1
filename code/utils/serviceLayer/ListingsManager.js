const util = require("util");
const utils = require("../utils");
const got = require('got');
const { lastIndexOf } = require("../../data/cookieSecret");
const { log } = require("console");

module.exports = class ListingsManager {
	constructor(pool, logger, listingsIndex) {
		this.logger = logger;
		this.pool = pool;
		this.listingsIndex = listingsIndex;
	}

	async createListing(params) {
		const connection = await utils.getConnection(this.pool);
		const query = util.promisify(connection.query).bind(connection);

		try {
			//get lat and long
			let {lat = 0, lng = 0} = await this.getLatAndLong(params.placeForVolunteering.replace(/<br\/>/g, " "));

			await query("START TRANSACTION;");
			await query("INSERT INTO `listings`(uuid, timeForVolunteering, placeForVolunteering, targetAudience, skills, requirements, opportunityDesc, opportunityCategory, opportunityTitle, numOfvolunteers, minHoursPerWeek, maxHoursPerWeek, duration, charityId, createdDate, pictureName, latitude, longitude) VALUES (uuid(), ?,?,?,?,?,?,?,?,?,?,?,?,?,UNIX_TIMESTAMP(), ?, ?, ?);", [params.timeForVolunteering, params.placeForVolunteering, this.createTargetAudienceString(params.targetAudience), params.skills, params.requirements, params.opportunityDesc, params.opportunityCategory, params.opportunityTitle, params.numOfvolunteers, params.minHoursPerWeek, params.maxHoursPerWeek, params.duration, params.charityId, params.fullNewFileName, lat, lng]);
			const charityName = (await query("SELECT charityName FROM charities WHERE id=?", [params.charityId]))[0].charityName;
			const queryResults = await query("SELECT LAST_INSERT_ID();");
			await query("COMMIT;");
			const valueString = params.opportunityDesc + " " + params.opportunityCategory + " " + params.opportunityTitle + " " + charityName;
			this.listingsIndex.add(queryResults[0]["LAST_INSERT_ID()"], valueString);
		} finally {
			connection.release();
		}
	}

	async searchListings(params) {
		const connection = await utils.getConnection(this.pool);
		const query = util.promisify(connection.query).bind(connection);

		try {
			let searchQuery = "";
			for (let term of params.terms) {
				searchQuery += term.toLowerCase() + " ";
			}
			const results = await this.getSearchListingsIds(searchQuery);

			if (results.length == 0) return {};

			const listingsData = await query("SELECT uuid, timeForVolunteering, scrapedCharityName, placeForVolunteering, targetAudience, skills, requirements, opportunityDesc, opportunityCategory, opportunityTitle, numOfvolunteers, minHoursPerWeek, maxHoursPerWeek, createdDate FROM listings WHERE id IN (?)", [results]);
			return listingsData;
		} finally {
			connection.release();
		}
	}

	async getLatAndLong(placeDesc){
		const geocodeString = `https://maps.googleapis.com/maps/api/geocode/json?address=${escape(placeDesc.replace(" ", "+"))}&key=AIzaSyDRcgQS1jUZ5ZcUykaM3RumTgbjpYvidX8`;
		const response = await got(geocodeString, { json: true });
		console.log(response.body.results, response.body.results[0]);
		if (response.body.results.length === 0) return {};
		console.log("full");
		console.log(response.body.results[0].geometry.location);
		return response.body.results[0].geometry.location; //lat, lng	
	}

	async getSearchListingsIds(searchQuery) {
		const results = await this.listingsIndex.search({
			query: searchQuery,
			suggest: true
		});
		return results;
	}

	createTargetAudienceString(selectedOptions) {
		selectedOptions = JSON.parse(selectedOptions);
		const audiences = ["teens", "people aged 18-55", "people over 55"];

		let selectedAudiences = [];
		for (let selectedOption of selectedOptions) {
			if (audiences[Number(selectedOption)] !== undefined) {
				selectedAudiences.push(audiences[Number(selectedOption)]);
			}
		}

		const output = selectedAudiences.join(", ");

		if (output === "") {
			return "everyone";
		} else {
			return output;
		}
	}

	async getAdvancedSearchListings(searchObj) {
		const allCriteria = ["hoursPerWeek", "category", "keywords", "location"];
		// get search criteria

		let keyNum = 0;

		for (const [key, value] of Object.entries(searchObj)) {
			if (!allCriteria.includes(key)) delete searchObj[key];
			else keyNum++;
		}

		console.log(searchObj);

		let baseSql = "SELECT id FROM `listings` WHERE ";

		if (keyNum === 0) return [];

		const connection = await utils.getConnection(this.pool);
		const query = util.promisify(connection.query).bind(connection);
		try {
			let ids = {};

			function updateIds(newIds, isSql){
				for(const newId of newIds){
					let key;
					if(isSql) key = newId.id;
					else key = newId;

					if (ids[key] === undefined) ids[key] = 1;
					else ids[key] += 1;
				}
			}

			if (searchObj["keywords"]) {
				const listingsIdsToSearch = await this.getSearchListingsIds(searchObj["keywords"]);
				console.log(listingsIdsToSearch);
				updateIds(listingsIdsToSearch, false);
				console.log("keyw");
			}
			if (searchObj["hoursPerWeek"]) {
				console.log("hpw", searchObj["hoursPerWeek"]);
				const newIds = await query("SELECT id FROM listings WHERE maxHoursPerWeek <= ? AND maxHoursPerWeek <> -1", [searchObj["hoursPerWeek"]]);
				console.log(newIds);
				updateIds(newIds,true);
			}
			if (searchObj["category"]) {
				const newIds = await query("SELECT id FROM listings WHERE opportunityCategory = ?", [searchObj["category"]]);
				console.log(newIds);
				updateIds(newIds, true);
				console.log("cat");
			}
			if (searchObj["location"]) {
				// const ids = await query("SELECT id FROM listings WHERE opportunityCategory = ?", [searchObj["category"]]);
				// console.log(ids);
			}

			console.log(ids)

			const listings = await query("SELECT id, uuid, timeForVolunteering, scrapedCharityName, placeForVolunteering, targetAudience, skills, requirements, opportunityDesc, opportunityCategory, opportunityTitle, numOfvolunteers, minHoursPerWeek, maxHoursPerWeek, createdDate FROM listings WHERE id IN (?)", [Object.keys(ids)]);

			for(let listing of listings){
				listing.weight = ids[listing.id];
				delete listing.id;
			}

			return listings;
		} finally {
			connection.release();
		}
	}
};