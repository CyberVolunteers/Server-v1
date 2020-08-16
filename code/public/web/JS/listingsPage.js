let listingsData;

$(function(){
	console.log("E");
	$.get("/getListings")
		.done(function(data, textStatus){
			listingsData = data;

			console.log(data);

			for(let i = 0; i < data.length; i++){
				const entry = data[i];
				const templateHTML = `
            <div class="listings" id="listing${i}" >
                <div class="listingHeader"><div class="listingscat">${entry.opportunityCategory}</div></div>
                <div class="listingsTime">
                    <div class="timehrs">${entry.minHoursPerWeek}-${entry.maxHoursPerWeek}</div>
                    <div class="perw">Hours per Week</div>
                </div>
                <div class="listingsloc"><div class="listingslocwriting">${entry.placeForVolunteering}</div>
                </div>
                <div class="listingxp"><div class="listingsxpwriting">${entry.requirements}</div>
                </div>
                <div class="imageholder" id="image${i}"></div>
                <div class="lstitle">${entry.opportunityTitle}</div>
                <div class="lstcharity">${entry.charityName}</div>
            </div>
            `;

				$(".listingsWrapper").append(templateHTML);
			}
			// TODO: redirect to a page
		})
		.fail(function(jqXHR){
			let errorText = jqXHR.statusText;
			// TODO: show the error message
		});

	$(".listingsWrapper").on("click", ".listings", function() {
		let indexInData = $(this).attr("id").match(/[0-9]+/)[0];

		let listingUuid = listingsData[indexInData].uuid;

		window.location.href = "../listing?uuid=" + listingUuid;
	});
});