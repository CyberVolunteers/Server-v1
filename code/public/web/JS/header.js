$(function(){
	$("a.myAccount").click(function(){
        window.location.href = `${window.location.protocol}//${window.location.host}/myAccount`;
    })
    $("a.join").click(function(){
        window.location.href = `${window.location.protocol}//${window.location.host}/joinUs`;
    })

    $("a.signIn").click(function(){
        window.location.href = `${window.location.protocol}//${window.location.host}/login`;
    })
});