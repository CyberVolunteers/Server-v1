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
  getAllListings();

  $(".listingsWrapper").on("click", ".listings", function () {
    let indexInData = $(this)
      .attr("id")
      .match(/[0-9]+/)[0];

    let listingUuid = listingsData[indexInData].uuid;

    window.location.href = "../listing?uuid=" + listingUuid;
  });
});

function getAllListings() {
  $.get("/getMyListings")
    .done(function (data, textStatus) {
      listingsData = data.reverse();

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
    timeString = `
		<div class="whenData">More Details</div>`;
    charityName = entry.scrapedCharityName;
    categoryName = "";
  } else {
    if (entry.isFlexible) timeString = "Flexible times";
    // if all defined, then do not say anything
    else if (!entry.minHoursPerWeek && !entry.maxHoursPerWeek) timeString = "";
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

function hoursPerWeek(num) {
  return `${xss(num)} hour${num === 1 ? "" : "s"} per week`;
}
