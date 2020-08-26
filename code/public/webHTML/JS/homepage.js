$(function(){
    $("#searchforlistings").click(function(){
        window.location.href = `${window.location.protocol}//${window.location.host}/listingsPage`;
    })

	$(".volunteerJoinButton").click(function(){
        window.location.href = `${window.location.protocol}//${window.location.host}/volunteerSignUp`;
    })

    $(".charityJoinButton").click(function(){
        window.location.href = `${window.location.protocol}//${window.location.host}/charitySignUp`;
    })
});