$(function(){
	let isVolunteer = true;

	$("#char").click(function(){
		isVolunteer = false;
		$("#vol").removeClass("selectedOption");
		$("#char").addClass("selectedOption");
	})

	$("#vol").click(function(){
		isVolunteer = true;
		$("#vol").addClass("selectedOption");
		$("#char").removeClass("selectedOption");
	})

	$("form").submit(function(){
		let email = $("#email").val();
		let password = $("#password").val();

		// time 2 weeks
		let maxAge = 2 * 7 * 24*60*60;

		// remember me cookie
		document.cookie = "rememberMe=" + $("#rememberMeCheckbox").is(":checked") + ";max-age=" + maxAge + ";path=/;";

		$.post("/login", {
			email: email,
			password: password,
			isVolunteer: isVolunteer
		})
		.done(function(data, textStatus){
			const params = new URLSearchParams(window.location.search)
			if(params.has("redirect")){
				window.location.href = `${window.location.protocol}//${window.location.host}/${params.get("redirect")}`
			}else{
				window.location.href = `${window.location.protocol}//${window.location.host}/listingsPage`;
			}
		})
		.fail(function(jqXHR){
			let errorText = jqXHR.statusText;

			if(jqXHR.status === 429) errorText = jqXHR.responseText
			$(".errorMessage").text(errorText);
			$(".errorMessage").show(500);
		});

		return false;
	});
});