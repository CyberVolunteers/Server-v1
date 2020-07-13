const express = require('express');
const path = require('path');
const exphbs  = require('express-handlebars');
const app = express();
const port = 1234;

app.engine('hbs', exphbs());
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/public'));

// serve the pages
app.get("*", function(req, res, next){
    if(req.url.includes(".")) return next();
    //return res.render(__dirname + "/public" + req.url + "/" + "index.hbs", {layout: false});
    next()
})

app.get("*", function(req, res, next){
    if(req.url.includes(".")) return next();

    res.render(__dirname + "/public/webproper/HTML/" + req.url.substring(0, req.url.length - 1) + ".hbs", {layout: false});
})

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, 'public/webproper')));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));