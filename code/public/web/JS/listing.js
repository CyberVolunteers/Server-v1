let map;

let xssOptions = {
	whiteList: {
		a: ["href", "class"],
		br: [],
		b: []
	}
};

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

			const isScraped = listing.minHoursPerWeek == -1;

			let timeString;
			if(isScraped) timeString = "N/A";
			else timeString = `${xss(listing.minHoursPerWeek)}-${xss(listing.maxHoursPerWeek)}`;

			const selectors = [".opertunitytitle", ".opdescriptiontext", ".placeInfo", ".timeInfo", ".timeReqNumbers", ".skills", ".requirements", ".recommendedGroups", ".opertunityorg"];
			const textsToFilter = [listing.opportunityTitle, listing.opportunityDesc, listing.placeForVolunteering, listing.timeForVolunteering, timeString, listing.skills, listing.requirements, listing.targetAudience, listing.charityName];

			for(let i = 0; i < selectors.length; i++){
				$(selectors[i]).html(xss(textsToFilter[i]));
			}

			//geocode
			const geocodeString = `https://maps.googleapis.com/maps/api/geocode/json?address=${escape(xss(listing.placeForVolunteering).replace(" ", "+"))}&key=AIzaSyDRcgQS1jUZ5ZcUykaM3RumTgbjpYvidX8`;
			console.log(geocodeString);
			$.get(geocodeString)
			.done(function(data){
				if(data.status === "ZERO_RESULTS"){
					$("#map").hide()
				}
				else if(data.status !== "OK"){
					console.log(data);
					$(".errorMessage").text("Something went wrong with the map, please try again letter or contact us");
					$(".errorMessage").show(500);
					return;
				}else{
					const results = data.results;
					const pos = results[0].geometry.location;

					marker = new google.maps.Marker({
						position: pos,
						map: map,
						title: 'Opportunity here'
					});

					map.setCenter(pos);
					map.setZoom(14);
				}
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

function xss(text){
	return filterXSS(text, xssOptions);
}