$(function(){
    var urlString = window.location.href;
    var url = new URL(urlString);

    const csrfToken = $("meta[name=\"csrf-token\"]").attr("content");

    $("form").submit(function(evt) {
        evt.preventDefault();
        console.log("submit");

        if($("#password1").val() !== $("#password2").val()){
            $(".errorMessage").text("The two passwords must match");
			$(".errorMessage").show(500);
        }else{
            $.post("/resetPassword", {
                email: url.searchParams.get("email"),
                password: $("#password1").val(),
                isVolunteer: url.searchParams.get("isVolunteer"),
                uuid: url.searchParams.get("uuid"),
                _csrf: csrfToken,
            })
            .done(function (data, textStatus) {
				console.log(data, textStatus);
                window.location.href = `${window.location.protocol}//${window.location.host}/login`;
			})
			.fail(function (jqXHR) {
				let errorText = jqXHR.statusText;
                console.log(jqXHR);

                $(".errorMessage").text(errorText);
				$(".errorMessage").show(500);
			});
        }
    })
})