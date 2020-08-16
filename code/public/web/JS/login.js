$(function(){
	$("form").submit(function(){
		let email = $(".email").val();
		let password = $(".password").val();

		// time 2 weeks
		let maxAge = 2 * 7 * 24*60*60;

		// remember me cookie
		document.cookie = "rememberMe=" + $("#rememberMeCheckbox").is(":checked") + ";max-age=" + maxAge + ";path=/;";
		console.log("rememberMe=" + $("#rememberMeCheckbox").is(":checked") + ";max-age=" + maxAge + ";path=/;");

		$.post("/login", {
			email: email,
			password: password,
			isVolunteer: true
		})
			.done(function(data, textStatus){
				console.log(data);
				// TODO: redirect to a page
			})
			.fail(function(jqXHR){
				let errorText = jqXHR.statusText;
				// TODO: show the error message
			});

		return false;
	});
});