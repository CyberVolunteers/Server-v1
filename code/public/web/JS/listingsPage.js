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

	$(".advancedSearchWrapper").hide();
	$(".catPopUp").hide();

	$(".advancedSearchButton").click(() => $(".advancedSearchWrapper").show());
	$(".CatagoriesButton").click((evt) => {
		$(".catPopUp").show();
		evt.stopPropagation();
	});

	$(".catPopUp").click(function(evt){
		evt.stopPropagation();
	})

	$("html").click(function(){
		$(".catPopUp").hide();
	})

	// toggleable groups
	let category = undefined;
	$(".iconGroup").click(function () {
		category = $(this).attr("id");

		console.log(category);
		advancedSearch(category);

		$(".catPopUp").hide();
	})

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

function advancedSearch(category) {
	let requestObj = {};
	$(".search-param").each(function () {
		const key = $(this).attr("name");
		const value = $(this).val();

		if (value !== "") requestObj[key] = value;
	})

	requestObj["category"] = category;

	// send a request
	$.get("/advancedSearchForListings", requestObj)
		.done(function (data, textStatus) {
			// filter out the ones that are too far away
			let { lat, lng } = data.location || {lat: 0, lang: 0};

			let listings = data.listings;

			console.log(listings);

			if (lat !== 0 || lng !== 0) listings.filter((obj) => {
				if (obj.latitude === 0 && obj.longitude === 0) return true;

				const x = (lng - obj.longitude) * Math.cos((lat + obj.latitude) / 2);
				const y = (lat - obj.latitude);
				const d = Math.sqrt(x * x + y * y) * R;

				if (d > maxDistance) return false;
				obj.weight += 1;
				return true;
			})

			listings.sort((a, b) => (b.weight - a.weight));

			$(".listingsWrapper").html("");
			for (entryId in listings) {
				let entry = listings[entryId];

				$(".listingsWrapper").append(constructHTML(entry, entryId));
			}
		})
		.fail(function (jqXHR) {
			let errorText = jqXHR.statusText;

			if (jqXHR.status === 429) errorText = jqXHR.responseText
			$(".errorMessage").text(errorText);
			$(".errorMessage").show(500);
		});
}

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

function constructHTML(entry, entryId) {
	let timeString, charityName, categoryName;

	const isScraped = entry.minHoursPerWeek == -1;

	if (isScraped) {
		timeString = timeString = `
		<div class="whenData">More Details</div>`;
		console.log([entry.scrapedCharityName])
		charityName = entry.scrapedCharityName;
		categoryName = "";
	}
	else {
		timeString = `
		<span class="timehrs cut-text">${xss(entry.minHoursPerWeek)}-${xss(entry.maxHoursPerWeek)}</span>
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
			</div>`
}

function xss(text) {
	return filterXSS(text, xssOptions);
}

function removeLineBreaks(text) {
	return text.replace(/(<([^>]+)>)/gi, " ");
}