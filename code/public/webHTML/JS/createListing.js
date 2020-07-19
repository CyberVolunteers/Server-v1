const orderOfPages = ["cat", "desc", "reqAndSkills", "otherFields"];

const arrowHTML = {
    next : `
        <div class="buttontext">Next</div>
        <img src="../IMG/whiteArrow2.svg" class="icon" id="whiteArrow">
    `,
    submit:`
        <div class="buttontext">Submit</div>
    `
}

$(function(){
    let pageIndex = 0;

    setPage(pageIndex);

    $(".prevButton").click(function(){
        if(pageIndex > 0){
            pageIndex--;
        setPage(pageIndex);
        }
    })

    $(".nextButton").click(function(){
        if(pageIndex < orderOfPages.length - 1){
            pageIndex++;
            setPage(pageIndex);
        }else{
            //submit
            console.log({
                timeForVolunteering: $("#timeForVolunteering").val(), 
                placeForVolunteering: $("#placeForVolunteering").val(), 
                targetAudience: getBestForData(), 
                skills: $("#skills").val(), 
                requirements: $("#requirements").val(), 
                opportunityDesc: $("#describtion").val(), 
                opportunityCategory: "test orange", 
                opportunityTitle: $("#opportunityTitle").val(), 
                numOfvolunteers: $("#numOfvolunteers").val(), 
                minHoursPerWeek: $("#minHoursPerWeek").val(), 
                maxHoursPerWeek: $("#maxHoursPerWeek").val()
            });
            $.post("/createListing", {
                timeForVolunteering: $("#timeForVolunteering").val(), 
                placeForVolunteering: $("#placeForVolunteering").val(), 
                targetAudience: getBestForData(), 
                skills: $("#skills").val(), 
                requirements: $("#requirements").val(), 
                opportunityDesc: $("#describtion").val(), 
                opportunityCategory: "test orange", 
                opportunityTitle: $("#opportunityTitle").val(), 
                numOfvolunteers: $("#numOfvolunteers").val(), 
                minHoursPerWeek: $("#minHoursPerWeek").val(), 
                maxHoursPerWeek: $("#maxHoursPerWeek").val()
            })
            .done(function(data, textStatus){
                console.log(data);
                // TODO: redirect to a page
            })
            .fail(function(jqXHR){
                let errorText = jqXHR.statusText;
                // TODO: show the error message
            })
        }

        //sending the data

        //TODO: checks of whether there is the data there
        //TODO: validate
        //TODO: finish the rest

        
    })
})

function setPage(index){
    for(subPageName of orderOfPages){
        $("." + subPageName).addClass("hiddenElement");
    }

    $("." + orderOfPages[index]).removeClass("hiddenElement");

    //if the last page, replace the "next" button with "submit", and replace it back otherwise
    if(index == orderOfPages.length - 1){
        $(".nextButton").html(arrowHTML["submit"]);
    }else{
        $(".nextButton").html(arrowHTML["next"]);
    }
}

function getBestForData(){
    const checkboxes = $(".bestForWrapper > div > input");
    let checkedBoxes = []
    checkboxes.each(function(index){
        //if checked, add to the array
        if($(this).is(":checked")) checkedBoxes.push(index);
    });

    return checkedBoxes;
}