$(function(){
    $("form").submit(function(){
        const options = {
            email: $("#username").val(),
            password: $("#password").val(),
            charityName: $("#name").val(),
            charityType: $("#type").val(),
            charityLocation: $("#location").val(),
            charityDesc: $("#description").val(),
            phoneNumber: $("#num").val(),
            websiteURL: $("#web").val(),
            sendHelpEmailsPeopleInGroups: $("#sendHelpEmailsPeopleInGroups").is(":checked"),
            isVolunteer: false
        };
        $.post("/signup", options)
		.done(function(data, textStatus){
			console.log(data);
			// TODO: redirect to a page
		})
		.fail(function(jqXHR){
            let errorText = jqXHR.statusText;
            console.log(errorText);
            $(".errorMessage").text(errorText);
			// TODO: show the error message
        });
        
        return false;
    })
})