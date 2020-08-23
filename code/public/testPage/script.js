$(function(){
    $(".button").click(function(){
        $.post("/signup", {
            password: "not secure",
            firstName: "John",
            lastName: "Smith",
            email: "anotherjsmith@gmail.com",
            gender:"m",
            salutation: "mr",
            nationality: "british",
            address: "123, null street, london",
            postcode: "123456-78",
            city: "london",
            country: "uk",
            phoneNumber: "01234567891011"

        }, function(data) {
            console.log(data);
          });
    })
})