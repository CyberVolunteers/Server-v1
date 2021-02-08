const maxDistance = 5; // km
const R = 6371; // km
const minLengthForSearch = 3;
let listingsData;

let xssOptions = {
	whiteList: {
		a: ["href", "class"],
		br: [],
		b: []
	}
};

$(function () {

	$(".advancedSearchWrapper").toggle();
	
	// toggleable groups
	let category = undefined;
	$(".iconGroup").click(function(){
        category = $(this).attr("id");

		$(".advancedSearchWrapper").toggle();
    })

	//redirect to search page
	$(".advancedSearchButton").click(function(){
		$(".advancedSearchWrapper").toggle();
	});

	getAllListings();
	$(".listingsWrapper").on("click", ".listings", function () {
		let indexInData = $(this).attr("id").match(/[0-9]+/)[0];

		let listingUuid = listingsData[indexInData].uuid;

		window.location.href = "../listing?uuid=" + listingUuid;
	});

	// for normal changes
	$(".searchBar").on("input", function () {
		// for enter presses
		// $(".searchBar").change(function(){
		const searchBar = $(".searchBar");
		const term = $.trim(searchBar.val());
		if (term.length >= minLengthForSearch) {
			console.log("'" + term + "'");
			$.get("/searchLisings/" + term)
				.done(function (data) {
					listingsData = data;
					//empty the listings
					$(".listingsWrapper").html("");
					for (entryId in data) {
						let entry = data[entryId];

						$(".listingsWrapper").append(constructHTML(entry, entryId));
					}
				}).fail(function (jqXHR) {
					let errorText = jqXHR.statusText;
					if (jqXHR.status === 429) errorText = jqXHR.responseText;
					$(".errorMessage").text(errorText);
					$(".errorMessage").show(500);
				})
		} else if (term.length == 0) {
			getAllListings();
		}
	})
});

function getAllListings() {
	$.get("/getListings")
		.done(function (data, textStatus) {
			listingsData = data;

			for (let i = 0; i < data.length; i++) {
				const entry = data[i];

				$(".listingsWrapper").append(constructHTML(entry, i));
			}
		})
		.fail(function (jqXHR) {
			let errorText = jqXHR.statusText;
			if (jqXHR.status === 429) errorText = jqXHR.responseText
			$(".errorMessage").text(errorText);
			$(".errorMessage").show(500);
		});
}

function constructHTML(entry, entryId){
	let timeString, charityName, categoryName;

	const isScraped = entry.minHoursPerWeek == -1;

	if(isScraped) {
		timeString = timeString = `
		<div class="whenData">${removeLineBreaks(xss(entry.timeForVolunteering))}</div>`;
		console.log([entry.scrapedCharityName])
		charityName = entry.scrapedCharityName;
		categoryName = "";
	}
	else {
		timeString = `
		<div class="timehrs cut-text">${xss(entry.minHoursPerWeek)}-${xss(entry.maxHoursPerWeek)}</div>
		<div class="perw">Hours per Week</div>`;
		charityName = entry.charityName;
		categoryName = entry.opportunityCategory;
	}

	return `
	<div class="listings" id="listing${entryId}" >
		<div class="listingHeader"><div class="listingscat cut-text">${xss(categoryName)}</div></div>
		<div class="listingsTime">
			${timeString}
		</div>
		<div class="listingsloc"><div class="listingslocwriting cut-text">${removeLineBreaks(xss(entry.placeForVolunteering))}</div>
		</div>
		<div class="listingxp"><div class="listingsxpwriting cut-text">${removeLineBreaks(xss(entry.requirements))}</div>
		</div>
		<div class="imageholder" id="image${1}" style="background-image: url(listingsPictures/${xss(entry.pictureName)});
		background-size: cover;
		background-position: center;"></div>
		<div class="lstitle cut-text">${xss(entry.opportunityTitle)}</div>
		<div class="lstcharity cut-text">${removeLineBreaks(xss(charityName))}</div>
	</div>`;
}

function xss(text){
	return filterXSS(text, xssOptions);
}

function removeLineBreaks(text){
	return text.replace(/(<([^>]+)>)/gi, " ");
}