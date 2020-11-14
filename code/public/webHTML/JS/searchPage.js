const minLengthForSearch = 3;
let listingsData;

$(function(){
    // for normal changes
    $(".searchBar").on("input", function(){ 
    // for enter presses
    // $(".searchBar").change(function(){
        const searchBar = $(".searchBar");
        const term = $.trim(searchBar.val());
        if(term.length >= minLengthForSearch){
            console.log("'" + term + "'");
            $.get("/searchLisings/" + term)
            .done(function(data){
                listingsData = data;
                //empty the listings
                $(".listingsWrapper").html("");
                for(entryId in data){
                    let entry = data[entryId];
                    const templateHTML = `
                    <div class="listings" id="listing${entryId}" >
                        <div class="listingHeader"><div class="listingscat cut-text">${filterXSS(entry.opportunityCategory)}</div></div>
                        <div class="listingsTime">
                            <div class="timehrs cut-text">${filterXSS(entry.minHoursPerWeek)}-${filterXSS(entry.maxHoursPerWeek)}</div>
                            <div class="perw">Hours per Week</div>
                        </div>
                        <div class="listingsloc"><div class="listingslocwriting cut-text">${filterXSS(entry.placeForVolunteering)}</div>
                        </div>
                        <div class="listingxp"><div class="listingsxpwriting cut-text">${filterXSS(entry.requirements)}</div>
                        </div>
                        <div class="imageholder" id="image${1}" style="background-image: url(listingsPictures/${filterXSS(entry.pictureName)});
                        background-size: cover;
                        background-position: center;"></div>
                        <div class="lstitle cut-text">${filterXSS(entry.opportunityTitle)}</div>
                        <div class="lstcharity cut-text">${filterXSS(entry.charityName)}</div>
                    </div>`;

                    $(".listingsWrapper").append(templateHTML);
                }
            }).fail(function(jqXHR){
                let errorText = jqXHR.statusText;
                if(jqXHR.status === 429) errorText = jqXHR.responseText;
                $(".errorMessage").text(errorText);
                $(".errorMessage").show(500);
            })
        }
    })

    $(".listingsWrapper").on("click", ".listings", function() {
		let indexInData = $(this).attr("id").match(/[0-9]+/)[0];

		let listingUuid = listingsData[indexInData].uuid;

		window.location.href = "../listing?uuid=" + listingUuid;
	});
})