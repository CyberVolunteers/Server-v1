const maxDistance = 5; // km
const R = 6371; // km
const minLengthForSearch = 3;
let listingsData;

let xssOptions = {
  whiteList: {
    a: ["href", "class"],
    br: [],
    b: [],
  },
};

$(function () {
  $(".advancedSearchWrapper").hide();
  $(".catPopUp").hide();

  $(".advancedSearchButton").click(() => $(".advancedSearchWrapper").toggle());
  $(".CatagoriesButton").click((evt) => {
    $(".catPopUp").show();
    evt.stopPropagation();
  });

  $(".catPopUp").click(function (evt) {
    evt.stopPropagation();
  });

  $("html, .confirmButton").click(function () {
    $(".catPopUp").hide();
  });

  // toggleable groups
  $(".iconGroup").click(function () {
    $(this).toggleClass("selected");
  });

  $(".searchButton").click(function () {
    advancedSearch();
  });

  getAllListings();
  $(".listingsWrapper").on("click", ".listings", function () {
    let indexInData = $(this)
      .attr("id")
      .match(/[0-9]+/)[0];

    let listingUuid = listingsData[indexInData].uuid;

    window.location.href = "../listing?uuid=" + listingUuid;
  });

  // for normal changes
  $(".searchBar").on("input", function () {
    search();
  });
});

function search() {
  const searchBar = $(".searchBar");
  const term = $.trim(searchBar.val());
  if (term.length >= minLengthForSearch) {
    $.get("/searchLisings/" + term)
      .done(function (data) {
        listingsData = data;
        //empty the listings
        $(".listingsWrapper").html("");
        for (entryId in data) {
          let entry = data[entryId];

          $(".listingsWrapper").append(constructHTML(entry, entryId));
        }
      })
      .fail(function (jqXHR) {
        let errorText = jqXHR.statusText;
        if (jqXHR.status === 429) errorText = jqXHR.responseText;
        $(".errorMessage").text(errorText);
        $(".errorMessage").show(500);
      });
  } else if (term.length == 0) {
    getAllListings();
  }
}

function advancedSearch() {
  let requestObj = {};
  $(".search-param").each(function () {
    const key = $(this).attr("name");
    const value = $(this).val();

    if (value !== "") requestObj[key] = value;
  });

  let categories = [];

  $(".iconGroup.selected").each(function () {
    categories.push($(this).attr("id"));
  });

  console.log(categories);

  if (categories === [] && requestObj === {}) return getAllListings();

  requestObj["categories"] = categories;

  // send a request
  $.get("/advancedSearchForListings", requestObj)
    .done(function (data, textStatus) {
      // filter out the ones that are too far away
      let { lat, lng } = data.location || { lat: 0, lang: 0 };

      listingsData = data.listings;

      console.log(listingsData);

      if (lat !== 0 || lng !== 0)
        listingsData.filter((obj) => {
          if (obj.latitude === 0 && obj.longitude === 0) return true;

          const x = (lng - obj.longitude) * Math.cos((lat + obj.latitude) / 2);
          const y = lat - obj.latitude;
          const d = Math.sqrt(x * x + y * y) * R;

          if (d > maxDistance) return false;
          obj.weight += 1;
          return true;
        });

      listingsData.sort((a, b) => b.weight - a.weight);

      $(".listingsWrapper").html("");
      for (entryId in listingsData) {
        let entry = listingsData[entryId];

        $(".listingsWrapper").append(constructHTML(entry, entryId));
      }
    })
    .fail(function (jqXHR) {
      let errorText = jqXHR.statusText;

      if (jqXHR.status === 429) errorText = jqXHR.responseText;
      $(".errorMessage").text(errorText);
      $(".errorMessage").show(500);
    });
}

function getAllListings() {
  $.get("/getListings")
    .done(function (data, textStatus) {
      data.reverse(); //make sure that the custom listings are at the bottom
      listingsData = data;
      console.log(listingsData);

      for (let i = 0; i < data.length; i++) {
        const entry = data[i];

        $(".listingsWrapper").append(constructHTML(entry, i));
      }
    })
    .fail(function (jqXHR) {
      let errorText = jqXHR.statusText;
      if (jqXHR.status === 429) errorText = jqXHR.responseText;
      $(".errorMessage").text(errorText);
      $(".errorMessage").show(500);
    });
}

function constructHTML(entry, entryId) {
  let timeString, charityName, categoryName;

  const isScraped = entry.minHoursPerWeek == -1;

  if (isScraped) {
    timeString = timeString = `
		<div class="whenData">More Details</div>`;
    charityName = entry.scrapedCharityName;
    categoryName = "";
  } else {
    timeString = `
		<span class="timehrs cut-text">${xss(entry.minHoursPerWeek)}-${xss(
      entry.maxHoursPerWeek
    )}</span>
		<span class="perw">Hours per Week</span>`;
    charityName = entry.charityName;
    categoryName = entry.opportunityCategory;
  }

  return `<div class="listings" id="listing${entryId}">
				<div class="listingHeader">
					<div class="listingscat cut-text">${xss(categoryName)}</div>
				</div>
				<div class="lstitle"> ${xss(entry.opportunityTitle)} </div>
				<div class="lstcharity cut-text">${removeLineBreaks(xss(charityName))}</div>
				<div class="listingsTime">
					<div class="timehrs">${timeString}</div>
				</div>
			</div>`;
}

function xss(text) {
  return filterXSS(text, xssOptions);
}

function removeLineBreaks(text) {
  return text.replace(/(<([^>]+)>)/gi, " ");
}
