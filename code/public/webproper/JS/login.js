$(function(){
    $("form").submit(function(){
        let email = $(".email").val();
        let password = $(".password").val();

        $.post("/login", {
            email: email,
            password: password
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