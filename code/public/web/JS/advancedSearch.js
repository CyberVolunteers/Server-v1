$(function () {
    $("#nextButton").click(function () {
        // make a request
        console.log("request");
        let requestObj = {};
        $(".search-param").each(function () {
            const key = $(this).attr("name");
            const value = $(this).val();

            if (value !== "") requestObj[key] = value;
        })

        console.log(requestObj);

        // send a request
        $.get("/advancedSearchForListings", requestObj)
            .done(function (data, textStatus) {
                console.log(data);
            })
            .fail(function (jqXHR) {
                let errorText = jqXHR.statusText;

                if (jqXHR.status === 429) errorText = jqXHR.responseText
                $(".errorMessage").text(errorText);
                $(".errorMessage").show(500);
            });
    });
});
