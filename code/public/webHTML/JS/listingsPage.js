let listingsData;

$(function(){
	$.get("/getListings")
		.done(function(data, textStatus){
			listingsData = data;

			for(let i = 0; i < data.length; i++){
				const entry = data[i];
				const templateHTML = `
				<div class="listings" id="listing${i}" >
					<div class="listingHeader"><div class="listingscat cut-text">${filterXSS(entry.opportunityCategory)}</div></div>
					<div class="listingsTime">
						<div class="timehrs cut-text">${filterXSS(entry.minHoursPerWeek)}-${filterXSS(entry.maxHoursPerWeek)}</div>
						<div class="perw">Hours per Week</div>
					</div>
					<div class="listingsloc"><div class="listingslocwriting cut-text">${filterXSS(entry.placeForVolunteering)}</div>
					</div>
					<div class="listingxp"><div class="listingsxpwriting cut-text">${filterXSS(entry.requirements)}</div>
					</div>
					<!--<div class="imageholder" id="image${i}"></div>-->
					<div class="lstitle cut-text">${filterXSS(entry.opportunityTitle)}</div>
					<div class="lstcharity cut-text">${filterXSS(entry.charityName)}</div>
				</div>
				`;

				$(".listingsWrapper").append(templateHTML);
			}
		})
		.fail(function(jqXHR){
			let errorText = jqXHR.statusText;
			$(".errorMessage").text(errorText);
			$(".errorMessage").show(500);
		});

	$(".listingsWrapper").on("click", ".listings", function() {
		let indexInData = $(this).attr("id").match(/[0-9]+/)[0];

		let listingUuid = listingsData[indexInData].uuid;

		window.location.href = "../listing?uuid=" + listingUuid;
	});
});