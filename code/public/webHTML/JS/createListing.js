const orderOfPages = ["otherFields", "desc", "reqAndSkills", "cat"];

const arrowHTML = {
	next : `
        <div class="buttontext">Next</div>
        <img src="../IMG/whiteArrow2.svg" class="icon" id="whiteArrow">
    `,
	submit:`
        <div class="buttontext">Submit</div>
    `
};

let pageIndex = 0;
let hasSelectedCat = false;

$(function(){
	const csrfToken = $("meta[name=\"csrf-token\"]").attr("content");

	setPage(pageIndex);

	// if the time is indefinite, don't allow the number
	$("#time-select").change(function(){
		if($("#time-select").val() === "indefinitely") $("#generalInputNum").prop("disabled", true);
		else $("#generalInputNum").prop("disabled", false);
	});

	//selecting the category
	$(".iconGroup").click(function(){
		// remove the class from everything
		$(".iconGroup").each(function(){
			$(this).removeClass("selectedIcon");
		});

		$(this).addClass("selectedIcon");

		hasSelectedCat = true;
	});

	$(".prevButton").click(function(){
		if(pageIndex > 0){
			pageIndex--;
			setPage(pageIndex);
		}
	});

	$(".nextButton").click(function(){
		if(!checkFieldsOnPage()) return;
		if(pageIndex < orderOfPages.length - 1){
			pageIndex++;
			setPage(pageIndex);
		}else{
			//submit
			$.post("/createListing", {
				duration: createDurationString($("#generalInputNum").val(), $("#time-select").val()),
				timeForVolunteering: $("#timeForVolunteering").val(), 
				placeForVolunteering: $("#placeForVolunteering").val(), 
				targetAudience: getBestForData().toString(), 
				skills: $("#skills").val(), 
				requirements: $("#requirements").val(), 
				opportunityDesc: $("#description").val(), 
				opportunityCategory: $(".selectedIcon").find(".catName").text(), 
				opportunityTitle: $("#opportunityTitle").val(), 
				numOfvolunteers: $("#numOfvolunteers").val(), 
				minHoursPerWeek: $("#minHoursPerWeek").val(), 
				maxHoursPerWeek: $("#maxHoursPerWeek").val(),
				_csrf: csrfToken
			})
				.done(function(data, textStatus){
					window.location.href = `${window.location.protocol}//${window.location.host}/formComplete`;
				})
				.fail(function(jqXHR){
					let errorText = jqXHR.statusText;
					$(".errorMessage").text(errorText);
					$(".errorMessage").show(500);
				});
		}
	});
});

function setPage(index){
	for(let subPageName of orderOfPages){
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
	let checkedBoxes = [];
	checkboxes.each(function(index){
		//if checked, add to the array
		if($(this).is(":checked")) checkedBoxes.push(index);
	});

	checkedBoxes = "[" + checkedBoxes.toString() + "]";

	return checkedBoxes;
}

function createDurationString(num, units){
	if(units === "indefinitely") return units;

	if (num == 1) return num + " " + units;
	return num + " " + units + "s";
}

function checkFieldsOnPage(){
	if(orderOfPages[pageIndex] === "cat"){
		if(!hasSelectedCat){
			$(".errorMessage").text("Please, select a category");
			$(".errorMessage").show(500);
		}
		return hasSelectedCat;
	}else
	{
		let result = true
		$("input, textarea").each(function (){
			if($(this).closest('.hiddenElement').length == 0){
				if(!$(this)[0].reportValidity()) result = false;
			}
		});

		return result;
	}
}