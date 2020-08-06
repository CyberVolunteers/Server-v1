const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const passport = require("passport");
const expressSession = require("express-session");
const exphbs  = require("express-handlebars");
const helmet = require("helmet");
const slowDown = require("express-slow-down");
const cookieParser = require('cookie-parser');
const flexSearch = require("flexsearch");
const util = require("util");
const csurf = require('csurf');

const LocalStrategy = require("passport-local").Strategy;

// SET UP

const app = express();

const settings = require("./settings");

const port = process.env.PORT || 1234;

// connect to the mysql db
const pool = mysql.createPool({
	connectionLimit : 10,
	host: "localhost",
	user: "serverQueryManager",
	password: require("./data/serverQueryManagerPass"),
	database: "cybervolunteers",
	timezone: "utc"
});

//set up the full text search
const listingsIndex = flexSearch.create({
	tokenize: "full",
	encode: "advanced",
	threshold: 0,
    async: true,
    worker: false,
    cache: false
});

// add all the existing listings
pool.query("SELECT id, opportunityDesc, opportunityCategory, opportunityTitle FROM `listings`", function(err, results){
	if (err) throw err;

	for(let i = 0; i < results.length; i++){
		const valueString = results[i].opportunityDesc + " " + results[i].opportunityCategory + " " + results[i].opportunityTitle;
		listingsIndex.add(results[i].id, valueString);
	}
});

//set the utc timezone
const timezone = "UTC";
process.env.TZ = timezone;

//winston
const logger = require("./utils/winston");

//layers
const UserManager = new (require("./utils/serviceLayer/UserManager.js"))(pool, logger);
const ListingsManager = new (require("./utils/serviceLayer/ListingsManager.js"))(pool, logger, listingsIndex);
const NodemailerManager = new (require("./utils/serviceLayer/NodemailerManager.js"))(pool, logger);
const Validator = new (require("./utils/Validator"))();


//passport
passport.use(new LocalStrategy({usernameField: "email"}, UserManager.localPassportVerify.bind(UserManager)));

// TODO: only check the data on the client, send errors to the client

// throttling
// TODO: set actual times
//TODO: for other endpoints, use passport id as the id?
//TODO:protect other endpoints
//TODO: tell the client that the limit has been reached and time left
const shortTermLoginRateLimit = slowDown({
	windowMs: 15 * 60 * 1000, // 15 minutes
	delayAfter: 10, // limit each IP to 100 requests per windowMs,
	delayMs: 10000,
	skipSuccessfulRequests: true
});

const longTermLoginRateLimit = slowDown({
	windowMs: 24 * 60 * 60 * 1000, // 1 day
	delayAfter: 50, // limit each IP to 100 requests per windowMs
	delayMs: 1 * 60 * 60 * 1000, // 1 hour
	skipSuccessfulRequests: true
});



// used to serialize the user for the session
passport.serializeUser(function(user, done) {
	done(null, user.id); 
});

// used to deserialize the user
passport.deserializeUser(async function(id, done) {
	const query = util.promisify(pool.query).bind(pool);
	try{
		const results = await query("SELECT * FROM `volunteers` WHERE `id`=?;", [id]);
		//TODO: cache?
		done(undefined, results[0]);
	}catch (err) {
		return done(err);
	}
});

//csrf
const csrfProtection = csurf();

// connections
app.engine("hbs", exphbs( {
	extname: "hbs",
	defaultView: "index",
	partialsDir: __dirname + "/public/partials/"
}));
app.set("views", path.join(__dirname, "public/web/HTML"));
app.set("view engine", "hbs");

app.use(helmet());
app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(require("cookie-parser")());
app.use(expressSession({
	secret: require("./data/cookieSecret"),
	name: "sessionId",
	secure : false, // TODO: set true in production?
	httpOnly: true,
	sameSite: true,// TODO: expiration + domain and path?
	resave: false,//TODO: should i change this one?
	saveUninitialized: true,//TODO: should i change this one?
})); // TODO: research the params, esp. maxAge
app.use(passport.initialize());
app.use(passport.session());




//express routing
app.use( (req, res, next) => {
	logger.info("requested " + req.originalUrl + " using " + req.method + ". is ajax? " + req.xhr);
	next();
});

// public pages

//requests

//sign up post
app.post("/signup", async function(req, res, next){

	const params = req.body;

	if(!Validator.signUpValidate(params)){
		res.statusMessage = "Bad data";
		return res.status(400).end();
	}

	//TODO: validate email and password

	try{
		const result = await UserManager.signUp(params);
		if(result.code === 200){
			return res.sendStatus(200);
		}else{
			res.statusMessage = result.message;
			return res.status(result.code).end();
		}
	}catch(err){
		return next(err);
	}
});

// TODO: check if already logged in
app.post("/login", shortTermLoginRateLimit, longTermLoginRateLimit, function(req, res, next){

	//TODO: a separate validation file
	//if credentials are missing
	if(!req.body.email || !req.body.password){
		res.statusMessage = "Please, enter your email and passowrd";
		return res.status(400).end();
	}

	passport.authenticate("local", (err, user, info) => {
		if(err) return next(err);
		if(info){
			res.statusMessage = info.message;
			return res.status(400).end();
		}
		if(!user){
			res.statusMessage = "Please, check your email and passowrd";
			return res.status(400).end();
		}
		req.login(user, (err) => {
			if (err) return next(err);
			return res.sendStatus(200);
		});

	})(req, res, next);
});

//pages
app.get("/login", renderPage("login"));
app.get("/signup", renderPage("signup"));

// TODO: test the logout function
// TODO: a logout page
app.get("/logout", logout(true));

app.get("/exampleForm", csrfProtection, renderPage("exampleForm"));

app.get("/verifyEmailToken", async function(req, res, next){
	const query = req.query;

	const uuid = query.uuid;
	const email = query.email;

	//if successful, show one page, otherwise, show another
	//TODO: set pages
	try{
		if(await NodemailerManager.verifyEmailToken(email, uuid)){
			logger.info("verified");
		}else{
			logger.info("not verified");
		}
	}catch(err){
		return next(err);
	}
})

app.post("/sendConfirmationEmail", csrfProtection, async function(req, res, next){
	const params = req.body;

	try{
		const reply = await NodemailerManager.sendConfirmationEmail(params.email);
		if(reply === true){
			return res.sendStatus(200);
		}else{
			logger.error(reply);
			res.statusMessage = reply;
			return res.status(500).end();
		}
	}catch(err){
		return next(err);
	}
})

app.use(express.static(path.join(__dirname, "public/web"))); // to serve js, html, css

// redirect to login if not authenticated
app.use(function(req, res, next){ 
	// let through if authenticated
	if (req.isAuthenticated()) return next();
	// if ajax, set send error code
	if (req.xhr) {
		return res.sendStatus(401).end();
	}
	// otherwise, return to login page
	return res.redirect("/login");
});

// private pages and requests
app.get("/listingsPage", renderPage("listingsPage"));
app.get("/listing", renderPage("listing"));
app.get("/createListing", csrfProtection, renderPage("createListing"));
//app.get("/advancedSearch", csrfProtection, renderPage("advancedSearch"));

app.post("/createListing", csrfProtection, async function(req, res, next){
	const params = req.body;

	if(!Validator.createListingValidate(params)){
		res.statusMessage = "Bad data";
		return res.status(400).end();
	}

	try{
		await ListingsManager.createListing(params);
		return res.sendStatus(200);
	}catch(err){
		return next(err);
	}
});

//TODO: check if it is a person or a company if the listing is accepted

app.get("/getListings", function(req, res, next){
	// TODO: if it is a company, show its own listings instead
	pool.query("SELECT uuid, timeForVolunteering, placeForVolunteering, targetAudience, skills, createdDate, requirements, opportunityDesc, opportunityCategory, opportunityTitle, numOfvolunteers, minHoursPerWeek, maxHoursPerWeek FROM `listings`", [], function(err, results){
		if (err) return next(err);

		return res.status(200).json(results);
	});
});

app.get("/getListing", function(req, res, next){
	if(!Validator.getListingValidate(req.query.uuid)){
		res.statusMessage = "Bad data";
		return res.status(400).end();
	}
	pool.query("SELECT timeForVolunteering, placeForVolunteering, targetAudience, skills, createdDate, requirements, opportunityDesc, opportunityCategory, opportunityTitle, numOfvolunteers, minHoursPerWeek, maxHoursPerWeek FROM `listings` WHERE `uuid`=?", [req.query.uuid], function(err, results){
		if (err) return next(err);

		return res.status(200).json(results);
	});
});

app.get("/searchListings", async function (req, res, next) {
	const params = req.query;
	if(!Validator.searchListingsValidate(params)){
		res.statusMessage = "Bad data";
		return res.status(400).end();
	}

	try{
		let results = await ListingsManager.searchListings(params);
		return res.status(200).send(results);
	}catch(err){
		return next(err);
	}
})

app.post("/applyForListing", csrfProtection, async function(req, res, next){
	const params = {
		"volunteerId": req.user.id,
		"listingUUID": req.body.listingUUID
	}

	if(!Validator.applyForListingValidate(params)){
		res.statusMessage = "Bad data";
		return res.status(400).end();
	}

	logger.info(params)

	try{
		const message = await NodemailerManager.applyForListing(params);
		if(message === undefined){
			
			return res.sendStatus(200);
		}else{
			res.statusMessage = message;
			return res.status(400).end();
		}
	}catch(err){
		return next(err);
	}
})

//csrf errors
app.use(function (err, req, res, next) {
	if (err.code !== 'EBADCSRFTOKEN') return next(err);
   
	// handle CSRF token errors here
	logger.warn("csrf failed");
	res.status(403).end();
})

//TODO: better 500 page and check for ajax
app.use(function (err, req, res, next) {
	logger.error("error:");
	logger.error(err.stack);
	res.status(500).send("Something broke!");
});

app.listen(port, () => logger.info(`Listening at http://localhost:${port}`));




function renderPage(filePath){
	return function (req, res){
		let params = {layout: false};

		if(req.csrfToken !== undefined) params.csrfToken = req.csrfToken();
		return res.render(filePath, params);
	};
}

function logout(logoutAnyway){
	return function (req, res, next) {

		// do not logout remember me but if not logout completely
		//TODO: do client-side remember me cookie
        if (req.cookies["rememberMe"] === "true" && !logoutAnyway) {
			logger.debug("did not log out because of rememberme");
			// TODO: what to do in this case?
            return next();
        }


        // clear cookies
        for (let cookieName of Object.keys(req.cookies)) {
            res.clearCookie(cookieName);
        }

        // if not logged out and passport session exists
        if (req.session.passport) {
            // log out and destroy session
            req.logout();
            logger.debug("Logged out");

            // deletes the record in passport
            req.session.destroy(function (err) {
                if (err) return next(err);
                logger.debug("Session destroyed by logout request");
                next();
            });
        } else {
            // the end
            next();
        }
    }
}

