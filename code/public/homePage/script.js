$(function(){
    $(".button").click(function(){
        $.post("/createAccount", {
            password: "not secure",
            firstName: "John",
            lastName: "Smith",
            email: "anotherjsmith@gmail.com"

        }, function(data) {
            console.log(data);
          });
    })
})