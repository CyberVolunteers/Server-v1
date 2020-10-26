$(function(){
    $("#submit").click(function(){
        $.post("/verifyCharity",
        {
            id: $("#verifyCharity").val()
        })
        .done(function(data, textStatus){
            console.log(data.message);
            $("#output").text(data.message);
        })
        .fail(function(jqXHR){
            console.log(jqXHR)
            $("#output").text(jqXHR.statusText);
        })

    })
})