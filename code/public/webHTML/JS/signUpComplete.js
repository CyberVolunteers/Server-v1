$(function(){
    $(".redirectButton").click(function(){
        window.location.href = `${window.location.protocol}//${window.location.host}/login?redirect=myAccount`;
    })
})