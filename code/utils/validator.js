const validator = require("validator");

module.exports = class Validator {
    constructor(){
    }

    signUpValidate(params){
        return this.checkIfUndefinedAndConvertToStrings(params, ["firstName", "lastName", "email", "password", "gender", "salutation", "nationality", "address", "postcode", "city", "country", "phoneNumber"])
        && this.isSuitableLength(params["firstName"], 30)
        && this.isSuitableLength(params["lastName"], 30)
        && this.isSuitableLength(params["email"], 320)
        && this.isSuitableLength(params["gender"], 1)
        && this.isSuitableLength(params["salutation"], 5)
        && this.isSuitableLength(params["nationality"], 56)
        && this.isSuitableLength(params["address"], 150)
        && this.isSuitableLength(params["postcode"], 12)
        && this.isSuitableLength(params["city"], 85)
        && this.isSuitableLength(params["country"], 56)
        && this.isSuitableLength(params["phoneNumber"], 16)

        && validator.isEmail(params["email"])

    }

    createListingValidate(params){
        return this.checkIfUndefinedAndConvertToStrings(params, ["timeForVolunteering", "placeForVolunteering", "targetAudience", "skills", "requirements", "opportunityDesc", "opportunityCategory", "opportunityTitle", "numOfvolunteers", "minHoursPerWeek", "maxHoursPerWeek"])
        && this.isSuitableLength(params["timeForVolunteering"], 100)
        && this.isSuitableLength(params["placeForVolunteering"], 150)
        && this.isSuitableLength(params["targetAudience"], 100)
        && this.isSuitableLength(params["skills"], 400)
        && this.isSuitableLength(params["requirements"], 500)
        && this.isSuitableLength(params["opportunityDesc"], 1250)
        && this.isSuitableLength(params["opportunityCategory"], 50)
        && this.isSuitableLength(params["opportunityTitle"], 50)

        && validator.isInt(params["numOfvolunteers"], {min: 0})
        && validator.isFloat(params["minHoursPerWeek"], {min: 0})
        && validator.isFloat(params["maxHoursPerWeek"], {min: 0})

        && parseFloat(params["minHoursPerWeek"]) <= parseFloat(params["maxHoursPerWeek"]);
    }

    searchListingsValidate(params){
        return this.checkIfUndefinedAndConvertToStrings(params, ["terms"])
        && Array.isArray(params.terms);
    }

    isSuitableLength(string, maxLen){
        return string.length <= maxLen;
    }

    checkIfUndefinedAndConvertToStrings(params, reqParams){
        for(let i = 0; i < reqParams.length; i++){
            const param = params[reqParams[i]];
            console.log([params[reqParams[i]], reqParams[i]])
            if(param === undefined || param === "" || param === null) return false;

            //convert to a string
            if(!Array.isArray(param)) params[reqParams[i]] = params[reqParams[i]] + "";

        }
        return true;
    }

    getListingValidate(uuid){
        return uuid != undefined && validator.isUUID(uuid);
    }
}