$(function(){
    $("form").submit(function(){
        console.log({
            email: $("#username").val(),
            password: $("#password").val(),
            charityName: $("#name").val(),
            charityType: $("#type").val(),
            charityLocation: $("#location").val(),
            charityDesc: $("#description").val(),
            phoneNumber: $("#num").val(),
            websiteURL: $("#web").val()
        });
        return false;
    })
})