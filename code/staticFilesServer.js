const express = require("express");
const path = require("path");
const exphbs  = require("express-handlebars");
const app = express();
const port = 1234;

<<<<<<< HEAD
app.engine("hbs", exphbs());
app.set("view engine", "hbs");
=======
app.engine('hbs', exphbs());
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/public'));
>>>>>>> client

// serve the pages
app.get("*", function(req, res, next){
	if(req.url.includes(".")) return next();

<<<<<<< HEAD
	res.render(__dirname + "/public" + req.url + "index.hbs", {layout: false});
});
app.use("/", express.static(path.join(__dirname, "public")));
=======
    res.render(__dirname + "/public" + req.url + "/" + "index.hbs", {layout: false});
})



app.use('/', express.static(path.join(__dirname, 'public')));
>>>>>>> client

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));