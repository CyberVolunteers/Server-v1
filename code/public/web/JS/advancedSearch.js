const maxDistance = 5; // km
const R = 6371; // km

let xssOptions = {
	whiteList: {
		a: ["href", "class"],
		br: [],
		b: []
	}
};

$(function () {
    $("#nextButton").click(function () {
        // make a request
        let requestObj = {};
        $(".search-param").each(function () {
            const key = $(this).attr("name");
            const value = $(this).val();

            if (value !== "") requestObj[key] = value;
        })

        // send a request
        $.get("/advancedSearchForListings", requestObj)
            .done(function (data, textStatus) {
                // filter out the ones that are too far away
                let { lat, lng } = data.location;

                let listings = data.listings;

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
                console.log(listings);

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
    });
});


function constructHTML(entry, entryId){
	let timeString, charityName, categoryName;

	const isScraped = entry.minHoursPerWeek == -1;

	if(isScraped) {
		timeString = timeString = `
		<div class="whenData">${removeLineBreaks(xss(entry.timeForVolunteering))}</div>`;
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