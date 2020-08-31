$(function(){
    $("#business-enquiries").click(function(){
        window.location.href = `${window.location.protocol}//${window.location.host}/contactUs?query=business`;
    })
    $("#media-enquiries").click(function(){
        window.location.href = `${window.location.protocol}//${window.location.host}/contactUs?query=media`;
    })
})