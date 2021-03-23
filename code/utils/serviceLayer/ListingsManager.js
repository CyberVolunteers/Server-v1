const util = require("util");
const utils = require("../utils");
const axios = require("axios");
const { lastIndexOf } = require("../../data/cookieSecret");

const maxWeightForKeywordSearch = 2;

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
      let { lat = 0, lng = 0 } = await this.getLatAndLong(
        params.placeForVolunteering.replace(/<br\/>/g, " ")
      );

      await query("START TRANSACTION;");
      await query(
        "INSERT INTO `listings`(uuid, timeForVolunteering, placeForVolunteering, targetAudience, skills, requirements, opportunityDesc, opportunityCategory, opportunityTitle, numOfvolunteers, minHoursPerWeek, maxHoursPerWeek, duration, charityId, createdDate, pictureName, latitude, longitude) VALUES (uuid(), ?,?,?,?,?,?,?,?,?,?,?,?,?,UNIX_TIMESTAMP(), ?, ?, ?);",
        [
          params.timeForVolunteering,
          params.placeForVolunteering,
          this.createTargetAudienceString(params.targetAudience),
          params.skills,
          params.requirements,
          params.opportunityDesc,
          params.opportunityCategory,
          params.opportunityTitle,
          params.numOfvolunteers,
          params.minHoursPerWeek,
          params.maxHoursPerWeek,
          params.duration,
          params.charityId,
          params.fullNewFileName,
          lat,
          lng,
        ]
      );
      const charityName = (
        await query("SELECT charityName FROM charities WHERE id=?", [
          params.charityId,
        ])
      )[0].charityName;
      const queryResults = await query("SELECT LAST_INSERT_ID();");
      await query("COMMIT;");
      const valueString =
        params.opportunityDesc +
        " " +
        params.opportunityCategory +
        " " +
        params.opportunityTitle +
        " " +
        charityName;
      this.listingsIndex.add(queryResults[0]["LAST_INSERT_ID()"], valueString);
    } finally {
      connection.release();
    }
  }

  async deleteListing(params) {
    const connection = await utils.getConnection(this.pool);
    const query = util.promisify(connection.query).bind(connection);

    try {
      await query("START TRANSACTION;");
      const listingId = (
        await query(
          "SELECT listings.id FROM listings WHERE listings.uuid=? AND listings.charityId=?",
          [params.uuid, params.charityId]
        )
      )?.[0]?.id;

      console.log(listingId);
      if (!listingId) return await query("ROLLBACK;");

      await query("DELETE FROM volunteers_listings WHERE listingId=?", [
        listingId,
      ]);

      await query("DELETE FROM listings WHERE uuid=?", [params.uuid]);
      await query("COMMIT;");
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

      const listingsData = await query(
        "SELECT listings.uuid, charities.charityName, listings.timeForVolunteering, listings.scrapedCharityName, listings.placeForVolunteering, listings.targetAudience, listings.skills, listings.requirements, listings.opportunityDesc, listings.opportunityCategory, listings.opportunityTitle, listings.numOfvolunteers, listings.minHoursPerWeek, listings.maxHoursPerWeek, listings.createdDate FROM listings INNER JOIN charities ON listings.charityId=charities.id WHERE listings.id IN (?)",
        [results]
      );
      return listingsData;
    } finally {
      connection.release();
    }
  }

  async getLatAndLong(placeDesc) {
    this.logger.info("Pinging google services");
    const geocodeString = `https://maps.googleapis.com/maps/api/geocode/json?address=${escape(
      placeDesc.replace(" ", "+")
    )}&key=AIzaSyDRcgQS1jUZ5ZcUykaM3RumTgbjpYvidX8`;
    const response = await axios.get(geocodeString);
    if (response.data.results.length === 0) return {};
    return response.data.results[0].geometry.location; //lat, lng
  }

  async getSearchListingsIds(searchQuery) {
    const results = await this.listingsIndex.search({
      query: searchQuery,
      suggest: true,
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
    const allCriteria = ["hoursPerWeek", "categories", "keywords", "location"];
    // get search criteria

    let keyNum = 0;

    for (const [key, value] of Object.entries(searchObj)) {
      if (!allCriteria.includes(key)) delete searchObj[key];
      else keyNum++;
    }

    let baseSql = "SELECT id FROM `listings` WHERE ";

    if (keyNum === 0) return [];

    const connection = await utils.getConnection(this.pool);
    const query = util.promisify(connection.query).bind(connection);
    try {
      let ids = {};

      function updateIds(newIds, isSql, weightStep = 0) {
        let weight = weightStep === 0 ? 1 : maxWeightForKeywordSearch;

        for (const newId of newIds) {
          let key;
          if (isSql) key = newId.id;
          else key = newId;

          if (ids[key] === undefined) ids[key] = weight;
          else ids[key] += weight;
          weight -= weightStep;
        }
      }

      if (searchObj["keywords"]) {
        const listingsIdsToSearch = await this.getSearchListingsIds(
          searchObj["keywords"]
        );

        // weight based on search order
        const weightStep =
          maxWeightForKeywordSearch / listingsIdsToSearch.length;

        updateIds(listingsIdsToSearch, false, weightStep);
      }
      if (searchObj["hoursPerWeek"]) {
        const newIds = await query(
          "SELECT id FROM listings WHERE maxHoursPerWeek <= ? AND maxHoursPerWeek <> -1",
          [searchObj["hoursPerWeek"]]
        );
        updateIds(newIds, true);
      }
      if (searchObj["categories"]) {
        const newIds = await query(
          "SELECT id FROM listings WHERE opportunityCategory in (?)",
          [searchObj["categories"]]
        );
        updateIds(newIds, true);
      }

      let idsToCheck = Object.keys(ids);

      const listings =
        idsToCheck.length === 0
          ? []
          : await query(
              "SELECT listings.id, listings.uuid, charities.charityName, listings.timeForVolunteering, listings.scrapedCharityName, listings.placeForVolunteering, listings.targetAudience, listings.skills, listings.requirements, listings.opportunityDesc, listings.opportunityCategory, listings.opportunityTitle, listings.numOfvolunteers, listings.minHoursPerWeek, listings.maxHoursPerWeek, listings.createdDate FROM listings INNER JOIN charities ON listings.charityId=charities.id WHERE listings.id IN (?)",
              [idsToCheck]
            );

      for (let listing of listings) {
        listing.weight = ids[listing.id];
        delete listing.id;
      }

      let returnData = { listings };

      if (searchObj["location"])
        returnData.location = await this.getLatAndLong(searchObj["location"]);

      return returnData;
    } finally {
      connection.release();
    }
  }
};
