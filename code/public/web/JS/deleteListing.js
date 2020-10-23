$(function(){
    $("#submit").click(function(){
        $.post("/deleteListing",
        {
            uuid: $("#deleteListingUuid").val(),
        })
        .done(function(data, textStatus){
            console.log(data);
            $("#output").text(data.message);
        })
        .fail(function(jqXHR){
            console.log(jqXHR)
            $("#output").text(jqXHR.statusText);
        })

    })
})