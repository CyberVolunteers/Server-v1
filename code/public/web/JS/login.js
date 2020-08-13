$(function(){
    $("form").submit(function(evt){
        let email = $(".email").val();
        let password = $(".password").val();

        console.log(email, password);

        //TODO: set the expiry, etc.
        // remember me cookie
        document.cookie = "rememberMe=" + $("#rememberMeCheckbox").is(':checked');

        $.post("/login", {
            email: email,
            password: password,
            isVolunteer: true
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