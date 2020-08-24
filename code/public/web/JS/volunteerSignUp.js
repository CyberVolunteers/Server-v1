$(function(){
    $("form").submit(function(){
        const options = {
            email: $("#username").val(),
            password: $("#password").val(),
            gender: $("#gender").val(),
            salutation: $("#Sal").val(),
            firstName: $("#fname").val(),
            lastName: $("#lname").val(),
            phoneNumber: $("#num").val(),
            birthDate: $("#bday").val(),
            nationality: $("#nation").val(),
            occupation: $("#occ").val(),
            address: $("#address").val(),
            postcode: $("#pc").val(),
            birthDate: $("#bday").val(),
            country: $("#country").val(),
            city: $("#city").val(),
            subject: $("#subject").val(),
            languages: $("#lang").val(),
            skillsAndInterests: $("#subject").val(),
            isVolunteer: true
        };

        //checks
        
        $.post("/signup", options)
		.done(function(data, textStatus){
			console.log(data);
			// TODO: redirect to a page
		})
		.fail(function(jqXHR){
            let errorText = jqXHR.statusText;
            $(".errorMessage").text(errorText);
            $(".errorMessage").show(500);
            console.log(errorText);
			// TODO: show the error message
        });
        
        return false;
    })
})