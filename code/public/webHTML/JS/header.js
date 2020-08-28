$(function(){
    $("a.homepageLink").click(function(){
        window.location.href = `${window.location.protocol}//${window.location.host}/`;
    })

	$("a.myAccount").click(function(){
        window.location.href = `${window.location.protocol}//${window.location.host}/myAccount`;
    })

    $("a.about").click(function(){
        window.location.href = `${window.location.protocol}//${window.location.host}/aboutUs`;
    })

    $("a.join").click(function(){
        window.location.href = `${window.location.protocol}//${window.location.host}/joinUs`;
    })

    $("a.signIn").click(function(){
        window.location.href = `${window.location.protocol}//${window.location.host}/login`;
    })

    $("a.search").click(function(){
        window.location.href = `${window.location.protocol}//${window.location.host}/listingsPage`;
    })

    $("a.contact").click(function(){
        window.location.href = `${window.location.protocol}//${window.location.host}/contactUsLinks`;
    })
});