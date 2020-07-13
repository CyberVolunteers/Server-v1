$(function(){
    $("form").submit(function(){
        $.get("/getListings", {
            timeRequirements: "timeRequirements",
            timeForVolunteering: "timeForVolunteering", 
            placeForVolunteering: "placeForVolunteering", 
            targetAudience: "targetAudience", 
            skills: "skills", 
            requirements: "requirements", 
            opportunityDesc: "opportunityDesc", 
            opportunityCategory: "opportunityCategory", 
            opportunityTitle: "opportunityTitle", 
            numOfvolunteers: 1234, 
            lengthOfTime: "lengthOfTime"
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