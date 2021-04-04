let canSendRequests = true;

let isVolunteerCookie = getCookie("isVolunteer");
let isVolunteer =
  isVolunteerCookie === undefined || isVolunteerCookie === ""
    ? true
    : isVolunteerCookie === "true";

$(function () {
  if (isVolunteer) {
    console.log("vol");
    $("#vol").addClass("selectedOption");
    $("#char").removeClass("selectedOption");
  } else {
    console.log("char");
    $("#vol").removeClass("selectedOption");
    $("#char").addClass("selectedOption");
  }

  $("#char").click(function () {
    isVolunteer = false;
    $("#vol").removeClass("selectedOption");
    $("#char").addClass("selectedOption");
  });

  $("#vol").click(function () {
    isVolunteer = true;
    $("#vol").addClass("selectedOption");
    $("#char").removeClass("selectedOption");
  });

  $("form").submit(function () {
    if (!canSendRequests) return;
    canSendRequests = false;
    let email = $("#email").val();
    let password = $("#password").val();

    // time 2 weeks
    let maxAge = 2 * 7 * 24 * 60 * 60;

    // remember me cookie
    document.cookie =
      "rememberMe=" +
      $("#rememberMeCheckbox").is(":checked") +
      ";max-age=" +
      maxAge +
      ";path=/;";

    $.post("/login", {
      email: email,
      password: password,
      isVolunteer: isVolunteer,
    })
      .done(function (data, textStatus) {
        canSendRequests = true;
        document.cookie = "isVolunteer=" + isVolunteer + ";path=/;";

        //redirect
        const params = new URLSearchParams(window.location.search);
        if (params.has("redirect")) {
          window.location.href = `${window.location.protocol}//${
            window.location.host
          }/${params.get("redirect")}`;
        } else {
          window.location.href = `${window.location.protocol}//${window.location.host}/listingsPage`;
        }
      })
      .fail(function (jqXHR) {
        canSendRequests = true;
        let errorText = jqXHR.statusText;

        if (jqXHR.status === 429) errorText = jqXHR.responseText;
        $(".errorMessage").text(errorText);
        $(".errorMessage").show(500);
      });

    return false;
  });

  $("a.resetPassword").click(function () {
    let email = $("#email").val();

    if (email === "") {
      $(".errorMessage").text("Please, include an email");
      $(".errorMessage").show(500);
    } else {
      window.location.href = `${window.location.protocol}//${window.location.host}/resetPasswordRequest?email=${email}&isVolunteer=${isVolunteer}`;
    }
  });
});

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}
