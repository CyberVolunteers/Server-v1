$(function(){
    $(".button").click(function(){
        $.post("/createUser", function() {
            console.log(data);
          });
    })
})