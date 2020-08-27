$(function(){
    const csrfToken = $("meta[name=\"csrf-token\"]").attr("content");

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
            isVolunteer: false,

            _csrf: csrfToken
        };
        $.post("/signup", options)
		.done(function(data, textStatus){
			window.location.href = `${window.location.protocol}//${window.location.host}/formComplete`;
		})
		.fail(function(jqXHR){
            let errorText = jqXHR.statusText;
            if(jqXHR.status === 429) errorText = jqXHR.responseText
			$(".errorMessage").text(errorText);
			$(".errorMessage").show(500);
        });
        
        return false;
    })
})