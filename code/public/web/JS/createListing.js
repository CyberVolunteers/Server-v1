const params = new URLSearchParams(window.location.search);
const isEdit = params.get("uuid") != null;
console.log(isEdit, params.get("uuid"));

const orderOfPages = ["otherFields", "desc", "reqAndSkills", "cat"];

const arrowHTML = {
  next: `
        <div class="buttontext">Next</div>
        <img src="../IMG/whiteArrow2.svg" class="icon" id="whiteArrow">
    `,
  submit: `
        <div class="buttontext">Submit</div>
    `,
};

let pageIndex = 0;
let hasSelectedCat = false;

$(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  // if editing, change the title
  $(document).attr("title", "Edit a listing");

  setPage(pageIndex);

  // pre-fill the values if editing
  if (isEdit) {
    $.get("/getListing", {
      uuid: params.get("uuid"),
    })
      .done(function (data, textStatus) {
        const entry = data[0];
        // do whatever you can
        for (let key of Object.keys(entry)) {
          $("#" + key).val(entry[key]);
        }

        // do the category
        let opportunityCategory = entry.opportunityCategory;
        $(`div.catName:contains('${opportunityCategory}')`).click(); // very dodgy, but it works
      })
      .fail(function (jqXHR) {
        console.log(jqXHR);
        let errorText = jqXHR.statusText;
        if (jqXHR.status === 429) errorText = jqXHR.responseText;
        $(".errorMessage").text(errorText);
        $(".errorMessage").show(500);
      });
  }

  // if the time is indefinite, don't allow the number
  $("#time-select").change(function () {
    if ($("#time-select").val() === "indefinitely")
      $("#generalInputNum").prop("disabled", true);
    else $("#generalInputNum").prop("disabled", false);
  });

  //selecting the category
  $(".iconGroup").click(function () {
    // remove the class from everything
    $(".iconGroup").each(function () {
      $(this).removeClass("selectedIcon");
    });

    $(this).addClass("selectedIcon");

    hasSelectedCat = true;
  });

  $(".prevButton").click(function () {
    if (pageIndex > 0) {
      pageIndex--;
      setPage(pageIndex);
    }
  });

  $(".nextButton").click(function () {
    if (!checkFieldsOnPage()) return;
    if (pageIndex < orderOfPages.length - 1) {
      pageIndex++;
      setPage(pageIndex);
    } else {
      const requestUrl = isEdit ? "/editListing" : "/createListing";

      console.log(requestUrl);
      $.post(requestUrl, {
        _csrf: csrfToken,
        duration: createDurationString(
          $("#generalInputNum").val(),
          $("#time-select").val()
        ),
        timeForVolunteering: $("#timeForVolunteering").val(),
        placeForVolunteering: $("#placeForVolunteering").val(),
        targetAudience: getBestForData().toString(),
        skills: $("#skills").val(),
        requirements: $("#requirements").val(),
        opportunityDesc: $("#opportunityDesc").val(),
        opportunityCategory: $(".selectedIcon").find(".catName").text(),
        opportunityTitle: $("#opportunityTitle").val(),
        numOfvolunteers: $("#numOfvolunteers").val(),
        minHoursPerWeek: $("#minHoursPerWeek").val(),
        maxHoursPerWeek: $("#maxHoursPerWeek").val(),
        isFlexible: $("#isFlexibleCheckbox").is(":checked"),
        uuid: params.get("uuid"),
      })
        .done(function (data, textStatus) {
          console.log("Finished request");
          window.location.href = `${window.location.protocol}//${window.location.host}/formComplete`;
        })
        .fail(function (jqXHR) {
          console.log(jqXHR);
          let errorText = jqXHR.statusText;
          if (jqXHR.status === 401) {
            window.location.href = `${window.location.protocol}//${window.location.host}/login`;
            return;
          }
          if (jqXHR.status === 429) errorText = jqXHR.responseText;
          $(".errorMessage").text(errorText);
          $(".errorMessage").show(500);
        });
    }
  });
});

function setPage(index) {
  for (let subPageName of orderOfPages) {
    $("." + subPageName).addClass("hiddenElement");
  }

  $("." + orderOfPages[index]).removeClass("hiddenElement");

  //if the last page, replace the "next" button with "submit", and replace it back otherwise
  if (index == orderOfPages.length - 1) {
    $(".nextButton").html(arrowHTML["submit"]);
  } else {
    $(".nextButton").html(arrowHTML["next"]);
  }
}

function getBestForData() {
  const checkboxes = $(".bestForWrapper > div > input");
  let checkedBoxes = [];
  checkboxes.each(function (index) {
    //if checked, add to the array
    if ($(this).is(":checked")) checkedBoxes.push(index);
  });

  checkedBoxes = "[" + checkedBoxes.toString() + "]";

  return checkedBoxes;
}

function createDurationString(num, units) {
  if (units === "indefinitely") return units;

  if (num == 1) return num + " " + units;
  return num + " " + units + "s";
}

function checkFieldsOnPage() {
  if (orderOfPages[pageIndex] === "cat") {
    if (!hasSelectedCat) {
      $(".errorMessage").text("Please, select a category");
      $(".errorMessage").show(500);
    }
    return hasSelectedCat;
  } else {
    let result = true;
    $("input, textarea").each(function () {
      if ($(this).closest(".hiddenElement").length == 0) {
        if (!$(this)[0].reportValidity()) result = false;
      }
    });

    return result;
  }
}
