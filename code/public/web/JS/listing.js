let isScraped;

let listing;

let isOwned = false;

let map;

let xssOptions = {
  whiteList: {
    a: ["href", "class"],
    br: [],
    b: [],
  },
};

$(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  const url = new URL(window.location.href);
  const uuid = url.searchParams.get("uuid");

  if (getCookie("isVolunteer") === "false") {
    $(".wantToHelpButton").hide();

    $.get("/isListingOwned", { uuid })
      .done(function (data, textStatus) {
        console.log([data]);
        isOwned = data;
        if (isOwned) $(".manageListing").show();
      })
      .fail(function (jqXHR) {
        console.log(jqXHR);
        let errorText = jqXHR.statusText;
        if (jqXHR.status === 429) errorText = jqXHR.responseText;
        $(".errorMessage").text(errorText);
        $(".errorMessage").show(500);
      });

    $(".del-btn").click(function () {
      modifyListing(uuid, "charityListings");
    });
    $(".edit-btn").click(function () {
      modifyListing(uuid, "createListing");
    });
  }

  $(".manageListing").hide();

  //get listing data
  $.get("/getListing", {
    uuid: uuid,
  })
    .done(function (data, textStatus) {
      listing = data[0];

      isScraped = listing.minHoursPerWeek == -1;

      let timeString, charityName;

      if (isScraped) {
        timeString = listing.duration;
        charityName = listing.scrapedCharityName;
      } else {
        timeString = `${xss(listing.minHoursPerWeek)}-${xss(
          listing.maxHoursPerWeek
        )} hours per week`;
        charityName = listing.charityName;
      }

      const selectors = [
        ".opertunitytitle",
        ".opdescriptiontext",
        ".placeInfo",
        ".timeInfo",
        ".timeReqNumbers",
        ".skills",
        ".requirements",
        ".recommendedGroups",
        ".opertunityorg",
      ];
      const textsToFilter = [
        listing.opportunityTitle,
        listing.opportunityDesc,
        listing.placeForVolunteering,
        listing.timeForVolunteering,
        timeString,
        listing.skills,
        listing.requirements,
        capitalizeIfNotHTML(listing.targetAudience),
        charityName,
      ];

      for (let i = 0; i < selectors.length; i++) {
        $(selectors[i]).html(xss(textsToFilter[i]));
      }
    })
    .fail(function (jqXHR) {
      console.log(jqXHR);
      let errorText = jqXHR.statusText;
      if (jqXHR.status === 429) errorText = jqXHR.responseText;
      $(".errorMessage").text(errorText);
      $(".errorMessage").show(500);
    });

  $(".confirmPopUp").hide();
  $(".wantToHelpButton").click(() => $(".confirmPopUp").show());
  $(".wantToHelpButton").click((evt) => evt.stopPropagation());
  $(".confirmPopUp").click((evt) => evt.stopPropagation());

  $("html, .confirmButton").click(function () {
    $(".confirmPopUp").hide();
  });

  $(".confirmButton").click(function () {
    // if it is a scraped listing, redirect to the website
    if (isScraped) {
      const url = listing.opportunityDesc.match(
        /\bhttps?:\/\/[^"\s]+(?!.*\bhttps?:\/\/[^"\s])/gi
      ); //get the last url in the "more details"
      window.location.href = url;
    } else {
      $.post("/applyForListing", {
        listingUUID: uuid,
        _csrf: csrfToken,
      })
        .done(function (data, textStatus) {
          window.location.href = `${window.location.protocol}//${window.location.host}/thankYouForHelping`;
        })

        .fail(function (jqXHR) {
          console.log(jqXHR);
          let errorText = jqXHR.statusText;
          if (jqXHR.status === 401) {
            window.location.href = `${window.location.protocol}//${
              window.location.host
            }/login?redirect=${escape("listing" + window.location.search)}`;
          } else {
            if (jqXHR.status === 429) errorText = jqXHR.responseText;
            $(".errorMessage").text(errorText);
            $(".errorMessage").show(500);
          }
        });
    }
  });
});

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 0, lng: 0 },
    zoom: 0,
  });
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function xss(text) {
  text += "";
  return filterXSS(text.replace(/\n/g, "<br/>"), xssOptions);
}

function modifyListing(uuid, redirectUrl) {
  $.get("/deleteListing", { uuid })
    .done(function (data, textStatus) {
      // go back
      window.location.href = `${window.location.protocol}//${window.location.host}/${redirectUrl}`;
    })
    .fail(function (jqXHR) {
      console.log(jqXHR);
      let errorText = jqXHR.statusText;
      if (jqXHR.status === 429) errorText = jqXHR.responseText;
      $(".errorMessage").text(errorText);
      $(".errorMessage").show(500);
    });
}

function capitalizeIfNotHTML(text) {
  if (text[0] !== "<") text = text.charAt(0).toUpperCase() + text.slice(1);
  return text;
}
