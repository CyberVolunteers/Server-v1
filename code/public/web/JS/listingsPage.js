let listingsData;

$(function(){
	console.log("E");
	$.get("/getListings")
		.done(function(data, textStatus){
			listingsData = data;

			for(let i = 0; i < data.length; i++){
				const entry = data[i];
				const templateHTML = `
				<div class="listings" id="listing${i}" >
					<div class="listingHeader"><div class="listingscat">${filterXSS(entry.opportunityCategory)}</div></div>
					<div class="listingsTime">
						<div class="timehrs">${filterXSS(entry.minHoursPerWeek)}-${filterXSS(entry.maxHoursPerWeek)}</div>
						<div class="perw">Hours per Week</div>
					</div>
					<div class="listingsloc"><div class="listingslocwriting">${filterXSS(entry.placeForVolunteering)}</div>
					</div>
					<div class="listingxp"><div class="listingsxpwriting">${filterXSS(entry.requirements)}</div>
					</div>
					<div class="imageholder" id="image${i}"></div>
					<div class="lstitle">${filterXSS(entry.opportunityTitle)}</div>
					<div class="lstcharity">TODO: fill in the charity name</div>
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