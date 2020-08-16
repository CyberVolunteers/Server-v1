$(function(){
	const csrfToken = $("meta[name=\"csrf-token\"]").attr("content");

	$("form").submit(function(){
		$.post("/signup", {
			// firstName: "firstName", 
			// lastName: "lastName", 
			// email: "new_email@a.com", 
			// password: "Password1", 
			// gender: "m", 
			// salutation: "Mr", 
			// nationality: "English", 
			// address: "Here", 
			// postcode: "ABC234", 
			// city: "Kazan", 
			// country: "Antarctica", 
			// phoneNumber: "1234567899876",

			"email": "email2@email.com",
			"password": "not secure",
			"charityType": "charityType",
			"charityName": "charityName",
			"charityDesc": "charityDesc",
			"phoneNumber": "1234567899876",
			"charityLocation": "charityLocation",
			"sendHelpEmailsPeopleInGroups": true,
			//"websiteURL": "https://reee.com",

			// timeRequirements: "timeRequirements",
			// timeForVolunteering: "timeForVolunteering", 
			// placeForVolunteering: "placeForVolunteering", 
			// targetAudience: "targetAudience", 
			// skills: "skills", 
			// requirements: "requirements", 
			// opportunityDesc: "test apple - word", 
			// opportunityCategory: "test orange", 
			// opportunityTitle: "test banana", 
			// numOfvolunteers: 1234, 
			// minHoursPerWeek: 2, 
			// maxHoursPerWeek: 4

			// terms: ["desc"]

			//email: "anotherjsmith@gmail.com", 

			//listingUUID: "8003b11b-d266-11ea-89c1-f06e0bbfcf89",

			isVolunteer: false,

			_csrf: csrfToken
		})
			.done(function(data, textStatus){
				console.log(data);
			})
			.fail(function(jqXHR){
				let errorText = jqXHR.statusText;
				console.log(errorText);
			});

		return false;
	});
});