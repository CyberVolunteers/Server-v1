//test values:
//password: "not secure",
//email: "anotherjsmith@gmail.com",


$(function(){
    $(".submit-button").click(function(){
        $.post("/login", {
            password: $("#password").val(),
            email: $("#email").val(),
        }, function(data) {
            console.log(data);
            
          });
    })
})