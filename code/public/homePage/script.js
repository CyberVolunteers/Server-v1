$(function(){
    $(".button").click(function(){
        $.post("/login", {
            password: "not secure",
            firstName: "John",
            lastName: "Smith",
            email: "anotherjsmith@gmail.com"

        }, function(data) {
            console.log(data);
          });
    })
})