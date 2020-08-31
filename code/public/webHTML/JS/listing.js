let map;

$(function(){
	const csrfToken = $("meta[name=\"csrf-token\"]").attr("content");



	const url = new URL(window.location.href);
	const uuid = url.searchParams.get("uuid");

	if(getCookie("isVolunteer") === "false") $(".wantToHelpButton").hide();

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
			$(".timeInfo").text(filterXSS(listing.timeForVolunteering));
			$(".timeReqNumbers").text(filterXSS(listing.minHoursPerWeek + "-" + listing.maxHoursPerWeek) + " hours per week");
			$(".skills").text(filterXSS(listing.skills));
			$(".requirements").text(filterXSS(listing.requirements));
			$(".recommendedGroups").text(filterXSS(listing.targetAudience));
			$(".opertunityorg").text(filterXSS(listing.charityName));

			//geocode
			const geocodeString = `https://maps.googleapis.com/maps/api/geocode/json?address=${escape(filterXSS(listing.placeForVolunteering).replace(" ", "+"))}&key=AIzaSyAO_Y95jkPGDVI6lLofm8pESkUhIW-sqts`;
			$.get(geocodeString)
			.done(function(data){
				if(data.status !== "OK"){
					$(".errorMessage").text("Something went wrong with the map, please try again letter or contact us");
					$(".errorMessage").show(500);
					return;
				}

				const results = data.results;
				const pos = results[0].geometry.location;

				marker = new google.maps.Marker({
					position: pos,
					map: map,
					title: 'Opportunity here'
				});

				map.setCenter(pos);
				map.setZoom(14);
			})
			.fail(function(jqXHR){
				console.log(jqXHR)
				$(".errorMessage").text("Something went wrong with the map, please try again letter or contact us");
				$(".errorMessage").show(500);
			})
		})
		.fail(function(jqXHR){
			let errorText = jqXHR.statusText;
			if(jqXHR.status === 429) errorText = jqXHR.responseText
			$(".errorMessage").text(errorText);
			$(".errorMessage").show(500);
		});

	const helpOfferButton = $(".wantToHelpButton");

	helpOfferButton.click(function(){
		$.post("/applyForListing",
			{
				listingUUID: uuid,
				_csrf: csrfToken
			})
			.done(function(data, textStatus){
				window.location.href = `${window.location.protocol}//${window.location.host}/thankYouForHelping`;
			})

			.fail(function(jqXHR){
				let errorText = jqXHR.statusText;
				if(jqXHR.status === 401){
					window.location.href = `${window.location.protocol}//${window.location.host}/login?redirect=${escape("listing" + window.location.search)}`;
				}else{
					if(jqXHR.status === 429) errorText = jqXHR.responseText
					$(".errorMessage").text(errorText);
					$(".errorMessage").show(500);
				}
			});
	});
});

function initMap() {
	map = new google.maps.Map(document.getElementById("map"), {
		center: { lat: 0, lng: 0 },
		zoom: 0
	});
}

function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}