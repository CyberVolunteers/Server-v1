$(function(){
    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    $("form").submit(function(){
        $.post("/applyForListing", {
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
            // phoneNumber: "1234567899876"

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

            listingUUID: "8003b11b-d266-11ea-89c1-f06e0bbfcf89",

            _csrf: csrfToken
        })
        .done(function(data, textStatus){
            console.log(data);
            // TODO: redirect to a page
        })
        .fail(function(jqXHR){
            let errorText = jqXHR.statusText;
            // TODO: show the error message
        })

        return false;
    })
})