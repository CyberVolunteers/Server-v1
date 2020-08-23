$(function(){
    $(".signOutButton").click(function(){
        window.location.href = `${window.location.protocol}//${window.location.host}/logout`;
    })

    $(".createAListingButton").click(function(){
        window.location.href = `${window.location.protocol}//${window.location.host}/createListing`;
    })
})