$(function(){
    $("form").submit(function(){
        $.post("/signup", {
            firstName: "firstName", 
            lastName: "lastName", 
            email: "a_new_email@a.com", 
            password: "Password1", 
            gender: "m", 
            salutation: "Mr", 
            nationality: "English", 
            address: "Here", 
            postcode: "ABC234", 
            city: "Kazan", 
            country: "Antarctica", 
            phoneNumber: "1234567899876"
            // timeRequirements: "timeRequirements",
            // timeForVolunteering: "timeForVolunteering", 
            // placeForVolunteering: "placeForVolunteering", 
            // targetAudience: "targetAudience", 
            // skills: "skills", 
            // requirements: "requirements", 
            // opportunityDesc: "opportunityDesc", 
            // opportunityCategory: "opportunityCategory", 
            // opportunityTitle: "opportunityTitle", 
            // numOfvolunteers: 1234, 
            // minHoursPerWeek: 2, 
            // maxHoursPerWeek: 4
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