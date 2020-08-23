$(function(){
	const csrfToken = $("meta[name=\"csrf-token\"]").attr("content");

	const url = new URL(window.location.href);
	const uuid = url.searchParams.get("uuid");

	//get listing data
	$.get("/getListing",
		{
			uuid: uuid
		}
	)
		.done(function(data, textStatus){
			const listing = data[0];
			$(".opertunitytitle").text(filterXSS(listing.opportunityTitle));
			$(".opdescriptiontext").text(filterXSS(listing.opportunityDesc));
			$(".placeInfo").text(filterXSS(listing.placeForVolunteering));
			$(".timeInfo").text(filterXSS(listing.opportunityDesc));
			$(".timeReqNumbers").text(filterXSS(listing.minHoursPerWeek + "-" + listing.maxHoursPerWeek));
			$(".skills").text(filterXSS(listing.skills));
			$(".recommendedGroups").text(filterXSS(listing.targetAudience));
			$(".opertunityorg").text(filterXSS(listing.charityName));
		})
		.fail(function(jqXHR){
			let errorText = jqXHR.statusText;
			$(".errorMessage").text(errorText);
			// TODO: show the error message
		});

	const helpOfferButton = $(".wantToHelpButton");

	helpOfferButton.click(function(){
		$.post("/applyForListing",
			{
				listingUUID: uuid,
				_csrf: csrfToken
			})
			.done(function(data, textStatus){
				console.log(data, textStatus);
			})

			.fail(function(jqXHR){
				let errorText = jqXHR.statusText;
				console.log(jqXHR)
				$(".errorMessage").text(errorText);
				if(jqXHR.status === 401){
					window.location.href = `${window.location.protocol}//${window.location.host}/login?redirect=${escape("listing" + window.location.search)}`;
				}
				// TODO: show the error message
			});
	});
});
