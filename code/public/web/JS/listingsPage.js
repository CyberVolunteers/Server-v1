const maxDistance = 5; // km
const R = 6371; // km
let listingsData;

let xssOptions = {
  whiteList: {
    a: ["href", "class"],
    br: [],
    b: [],
  },
};

const opportunityCategoryStyleClasses = {
  "Justice & Legal": "cat-law",
  "Healthcare & Medicine": "cat-med",
  Education: "cat-ed",
  "Computers & Technology": "cat-comp",
  Community: "cat-com",
  "Arts & Culture": "cat-cult",
  "Advocacy & Human Rights": "cat-rights",
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

  getAllListings();
  $(".listingsWrapper").on("click", ".listings", function () {
    let indexInData = $(this)
      .attr("id")
      .match(/[0-9]+/)[0];

    let listingUuid = listingsData[indexInData].uuid;

    window.location.href = "../listing?uuid=" + listingUuid;
  });

  // for normal changes
  $(".searchButton").click(function () {
    search();
    // advancedSearch();
  });

  $("input").keydown(function (e) {
    if (e.keyCode == 13) {
      search();
    }
  });
});

function search() {
  // check if it is open
  // TODO
  const isAdvancedSearch = $(".advancedSearchWrapper").is(":visible");
  if (isAdvancedSearch) return advancedSearch();

  const searchBar = $(".searchBar");
  const term = $.trim(searchBar.val());
  if (term.length === 0) return getAllListings();

  $.get("/searchLisings/" + term)
    .done(function (data) {
      data.reverse();
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

  if (categories === [] && requestObj === {}) return getAllListings();

  requestObj.categories = categories;
  requestObj.keywords = $.trim($(".searchBar").val());

  requestObj.isFlexible = $("#isFlexibleCheckbox").is(":checked");

  // send a request
  $.get("/advancedSearchForListings", requestObj)
    .done(function (data, textStatus) {
      // filter out the ones that are too far away
      let { lat, lng } = data.location || { lat: 0, lang: 0 };

      listingsData = data.listings;
      listingsData.reverse();

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

      // randomize the order of the real listings
      let real = [],
        scraped = [];
      listingsData.forEach((e) =>
        (e.scrapedCharityName === null ? real : scraped).push(e)
      );

      listingsData = shuffle(real);
      listingsData = listingsData.concat(scraped);

      for (let i = 0; i < listingsData.length; i++) {
        const entry = listingsData[i];

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
    // if all defined, then do not say anything
    if (!entry.minHoursPerWeek && !entry.maxHoursPerWeek) timeString = "";
    else if (!entry.minHoursPerWeek)
      timeString = `Up to ${hoursPerWeek(entry.maxHoursPerWeek)}`;
    else if (entry.minHoursPerWeek === entry.maxHoursPerWeek)
      timeString = hoursPerWeek(entry.minHoursPerWeek);
    else
      timeString = `${xss(entry.minHoursPerWeek)}-${hoursPerWeek(
        entry.maxHoursPerWeek
      )}`;
    timeString = `
		<span class="timehrs cut-text">${timeString}</span>`;

    charityName = entry.charityName;
    categoryName = entry.opportunityCategory;
  }

  const cssClass =
    opportunityCategoryStyleClasses[entry.opportunityCategory] ?? "cat-na";

  return `<div class="listings" id="listing${entryId}">
				<div class="listingHeader ${cssClass}">
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

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function hoursPerWeek(num) {
  return `${xss(num)} hour${num === 1 ? "" : "s"} per week`;
}
