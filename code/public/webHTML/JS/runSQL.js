$(function(){
    $("#submit").click(function(){
        $.post("/runSQL",
        {
            sql: $("#sql").val()
        })
        .done(function(data, textStatus){
            console.log(data);
            $("#output").html("<pre>"+JSON.stringify(data, undefined, 2) +"</pre>");
        })
        .fail(function(jqXHR){
            console.log(jqXHR)
            $("#output").text(jqXHR.statusText);
        })

    })
})