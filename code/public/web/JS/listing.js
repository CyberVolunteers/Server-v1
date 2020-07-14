$(function(){
    const url = new URL(window.location.href);
    const id = url.searchParams.get("id");
    $.get("/getListing",
    {
        id: id
    }
    )
    .done(function(data, textStatus){
        const listing = data[0];
        $(".opertunitytitle").text(listing.opportunityTitle);
        $(".opdescriptiontext").text(listing.opportunityDesc);
        $(".placeInfo").text(listing.placeForVolunteering);
        $(".timeInfo").text(listing.opportunityDesc);
        $(".timeReqNumbers").text(listing.minHoursPerWeek + "-" + listing.maxHoursPerWeek);
        $(".skills").text(listing.skills);
        $(".recommendedGroups").text(listing.targetAudience);
    })
    .fail(function(jqXHR){
        let errorText = jqXHR.statusText;
        // TODO: show the error message
    })
})