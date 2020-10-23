const express = require("express");
const path = require("path");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const passport = require("passport");
const expressSession = require("express-session");
const exphbs  = require("express-handlebars");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const flexSearch = require("flexsearch");
const util = require("util");
const utils = require("./utils/utils");
const csurf = require("csurf");
const favicon = require('serve-favicon');
const xss = require("xss");
const multer = require('multer');
const crypto = require("crypto");


const LocalStrategy = require("passport-local").Strategy;

const settings = require("./settings");

// SET UP

const app = express();

const port = process.env.PORT || 1234;
const isProduction = process.platform !== "win32";
const hostName = isProduction? "https://cybervolunteers.org.uk/": "http://localhost:1234/";

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
const NodemailerManager = new (require("./utils/serviceLayer/NodemailerManager.js"))(pool, logger, hostName);
const Validator = new (require("./utils/validator"))();


//passport
passport.use(new LocalStrategy({usernameField: "email", passReqToCallback: true,}, UserManager.localPassportVerify.bind(UserManager)));

// throttling
// TODO: set actual times
//TODO:protect other endpoints
//TODO: tell the client that the limit has been reached and time left
const shortTermLoginRateLimit = rateLimit({
	windowMs: 24 * 60 * 60 * 1000, // 1 day
	max: 7, // limit each IP to 7 requests per windowMs,
	skipSuccessfulRequests: true,
	message: "You are doing this too much. Please try doing this a day later or contact us if you think this was a mistake"
});

const longTermLoginRateLimit = rateLimit({
	windowMs: 24 * 24 * 60 * 60 * 1000, // 24 days
	max: 21, // limit each IP to 21 requests per windowMs
	skipSuccessfulRequests: true,
	message: "You are doing this too much. Please try doing this later or contact us if you think this was a mistake"
});

const signUpRateLimit = rateLimit({
	windowMs: 24 * 24 * 60 * 60 * 1000, // 24 days
	max: 3, // limit each IP to 21 requests per windowMs
	message: "You are doing this too much. Please try doing this later or contact us if you think this was a mistake"
});

const createListingRateLimit = rateLimit({
	windowMs: 7 * 24 * 60 * 60 * 1000, // 1 week
	max: 100, // limit each IP to 100 requests per windowMs
	message: "You are doing this too much. Please try doing this a week later or contact us if you think this was a mistake"
});

const getListingRateLimit = rateLimit({
	windowMs: 1 * 24 * 60 * 60 * 1000, // 1 day
	max: 1000, // limit each IP to 100 requests per windowMs
	message: "You are doing this too much. Please try doing this a day later or contact us if you think this was a mistake"
});

//multer
const Storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, "./pictures/listingsPictures");
	},
	filename: function(req, file, callback) {
		req.body.newFileName = crypto.randomBytes(24).toString('hex');
		req.body.fileExt = path.extname(file.originalname);
		req.body.fullNewFileName = req.body.newFileName + req.body.fileExt;
		callback(null, req.body.fullNewFileName);
	}
});

const listingImageUpload = multer({
	storage: Storage,
	limits: {
		fileSize: 7 * 1024 * 1024 //7 MB
	},
	fileFilter: utils.imageValidator
});

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
	done(null, {
		id: user.id,
		isVolunteer: user.isVolunteer
	}); 
});

// used to deserialize the user
passport.deserializeUser(async function(id, done) {
	const query = util.promisify(pool.query).bind(pool);
	try{
		let results;
		if(id.isVolunteer){
			results = await query("SELECT * FROM `volunteers` WHERE `id`=?;", [id.id]);
		}else{
			results = await query("SELECT * FROM `charities` WHERE `id`=?;", [id.id]);
		}
		//TODO: cache?
		done(undefined, results[0]);
	}catch (err) {
		return done(err);
	}
});

//csrf
const csrfProtection = csurf();

// connections
app.set("trust proxy", 1);
app.engine("hbs", exphbs( {
	extname: "hbs",
	defaultView: "index",
	partialsDir: __dirname + "/public/partials/"
}));
app.set("views", path.join(__dirname, "public/web/HTML"));
app.set("view engine", "hbs");

app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(require("cookie-parser")());
app.use(expressSession({
	secret: require("./data/cookieSecret"),
	name: "sessionId",
	secure : true,
	httpOnly: true,
	sameSite: true,// TODO: expiration + domain and path?
	resave: false,//TODO: should i change this one?
	saveUninitialized: false,//TODO: should i change this one?
})); // TODO: research the params, esp. maxAge
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(passport.initialize());
app.use(passport.session());




//express routing
app.use( (req, res, next) => {
	logger.info("requested " + req.originalUrl + " using " + req.method + ". is ajax? " + req.xhr);
	next();
});

// public pages

//requests

app.use(express.static(path.join(__dirname, "pictures"))); // to serve pictures

//pages
app.get("/", renderPage("homepage"))
app.get("/login", logout(false), renderPage("login"));
app.get("/volunteerSignUp", csrfProtection, renderPage("volunteerSignUp"));
app.get("/charitySignUp", csrfProtection, renderPage("charitySignUp"));
app.get("/joinUs", renderPage("joinUs"));
app.get("/contactUs", renderPage("contactUs"));
app.get("/contactUsLinks", renderPage("contactUsLinks"));
app.get("/listingsPage", renderPage("listingsPage"));
app.get("/listing", csrfProtection, renderPage("listing"));
app.get("/aboutUs", renderPage("aboutUs"));
app.get("/formComplete", renderPage("formComplete"));
app.get("/signUpComplete", renderPage("signUpComplete"));

//downloadables

app.get('/downloadPrivacyPolicy', function(req, res){
	const file = `${__dirname}/public/downloadables/privacyPolicy.docx`;
	res.download(file);
});

app.get('/downloadTermsOfUse', function(req, res){
	const file = `${__dirname}/public/downloadables/termsOfUse.docx`;
	res.download(file);
});

//sign up post
app.post("/signup", csrfProtection, signUpRateLimit, async function(req, res, next){

	const params = req.body;
	const isVolunteer = params.isVolunteer === "true";

	let validationSuccess;
	if(isVolunteer){
		validationSuccess = Validator.signUpValidateVolunteer(params);
	}else{
		validationSuccess = Validator.signUpValidateCharity(params);
	}

	if(!validationSuccess){
		res.statusMessage = "Bad data";
		return res.status(400).end();
	}

	try{
		let result;
		if(isVolunteer){
			result = await UserManager.signUpVolunteer(params);
		}else{
			result = await UserManager.signUpCharity(params);
		}
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

app.post("/login", shortTermLoginRateLimit, longTermLoginRateLimit, function(req, res, next){

	//if credentials are missing
	if(!req.body.email || !req.body.password){
		res.statusMessage = "Please, enter your email and password";
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

app.get("/logout", logout(true), function(req, res, next){
	res.redirect("/login");
});

app.get("/exampleForm", csrfProtection, renderPage("exampleForm"));

app.get("/verifyEmailToken", async function(req, res, next){
	const query = req.query;

	const uuid = query.uuid;
	const email = query.email;

	if(!Validator.verifyEmailTokenValidate(query)){
		res.statusMessage = "Bad data";
		return res.status(400).end();
	}



	//if successful, show one page, otherwise, show another
	try{
		const isSuccess = await NodemailerManager.verifyEmailToken(email, uuid);
		if(isSuccess){
			logger.info("verified");
		}else{
			logger.info("not verified");
		}

		res.isSuccessful = isSuccess;

		return next();
	}catch(err){
		return next(err);
	}
}, renderPage("verificationResult"));

app.get("/getListings", getListingRateLimit, function(req, res, next){
	pool.query("SELECT charities.charityName, listings.uuid, listings.timeForVolunteering, listings.placeForVolunteering, listings.targetAudience, listings.skills, listings.createdDate, listings.requirements, listings.opportunityDesc, listings.opportunityCategory, listings.opportunityTitle, listings.numOfvolunteers, listings.minHoursPerWeek, listings.maxHoursPerWeek, listings.pictureName FROM `listings` INNER JOIN charities ON listings.charityId=charities.id", [], function(err, results){
		if (err) return next(err);

		return res.status(200).json(results);
	});
});

app.get("/getListing", getListingRateLimit, function(req, res, next){
	if(!Validator.getListingValidate(req.query.uuid)){
		res.statusMessage = "Bad data";
		return res.status(400).end();
	}
	pool.query("SELECT charities.charityName, listings.timeForVolunteering, listings.placeForVolunteering, listings.targetAudience, listings.skills, listings.createdDate, listings.requirements, listings.opportunityDesc, listings.opportunityCategory, listings.opportunityTitle, listings.numOfvolunteers, listings.minHoursPerWeek, listings.maxHoursPerWeek, listings.pictureName FROM `listings` INNER JOIN charities ON listings.charityId=charities.id  WHERE `uuid`=?", [req.query.uuid], function(err, results){
		if (err) return next(err);

		return res.status(200).json(results);
	});
});

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
app.get("/sendConfirmationEmail", csrfProtection, async function(req, res, next){
	const email = req.user.email;
	const isVolunteer = req.session.passport.user.isVolunteer;

	try{
		const reply = await NodemailerManager.sendConfirmationEmail(email, isVolunteer);
		logger.info(reply);
		if(reply === true){
			return next();
		}else{
			logger.error(reply);
			return res.send(reply);
		}
	}catch(err){
		return next(err);
	}
}, renderPage("verificationEmailSent"));

// don't allow charities that are not verified to access these pages
app.all("*", function(req, res, next){
	if(req.user.isEmailVerified === 0){
		if(req.method === "GET" && !req.xhr) {
			return res.redirect("sendConfirmationEmail");
		}else{
			res.statusMessage = "Please, go to my Account page to verify your email first";
			return res.status(403).end();
		}
	}
	if(req.session.passport.user.isVolunteer !== true){
		if (req.user.isVerifiedByUs === 0){
			return renderPage("needToBeVerified")(req, res);
		}
	}

	return next();
});

app.get("/thankYouForHelping", renderPage("thankYouForHelping"));

//private pages

app.get("/createListing", function(req, res, next){
	if(req.session.passport.user.isVolunteer === false) return next();
	return renderPage("needToBeACharity")(req, res);
}, csrfProtection, renderPage("createListing"));
//app.get("/advancedSearch", csrfProtection, renderPage("advancedSearch"));
app.get("/myAccount", function(req, res, next){
	const isVolunteer = req.session.passport.user.isVolunteer;

	if(isVolunteer){
		return renderPage("myAccountVolunteer")(req, res, next);
	}else{
		return renderPage("myAccountCharity")(req, res, next);
	}
});

app.post("/createListing", csrfProtection, createListingRateLimit, async function(req, res, next){

	try{
		await util.promisify(listingImageUpload.single("listingPicture"))(req, res);
	}catch(err){
		if (err instanceof multer.MulterError) {
			return next(err);
		}else{
			res.statusMessage = "An error occured, please try again later";
			logger.error("Error:")
			logger.error(err.stack);
			return res.status(400).end();
		}
	}

	const params = req.body;
	const isVolunteer = req.session.passport.user.isVolunteer;

	params.charityId = req.user.id;

	if(isVolunteer){
		res.statusMessage = "You don't have permission to create a listing";
		return res.status(403).end();
	}

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
});

app.post("/applyForListing", csrfProtection, async function(req, res, next){

	if(req.session.passport.user.isVolunteer !== true){
		res.statusMessage = "You need to be a volunteer to apply for a listing";
		return res.status(403).end();
	}

	const params = {
		"volunteerId": req.user.id,
		"listingUUID": req.body.listingUUID
	};

	if(!Validator.applyForListingValidate(params)){
		res.statusMessage = "Bad data";
		return res.status(400).end();
	}

	logger.info(params);

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
});

app.get("/nonverifiedCharities", blockNonAdmins, function(req, res, next){
	pool.query("SELECT * FROM charities WHERE isVerifiedByUs=0", [], function(err, results){
		if(err) return res.send(err);
		return res.json(results);
	});
});

app.get("/verifyCharity", blockNonAdmins, renderPage("verifyCharity"));
app.get("/deleteListing", blockNonAdmins, renderPage("deleteListing"));
app.get("/runSQL", blockNonAdmins, renderPage("runSQL"));

app.post("/verifyCharity", blockNonAdmins, function(req, res, next){
	const verifyEmail = req.body.verifyEmail === "true";
	const sql = verifyEmail ? "UPDATE charities set isVerifiedByUs=1, isEmailVerified=1 WHERE isVerifiedByUs=0 AND id=?" : "UPDATE charities set isVerifiedByUs=1 WHERE isVerifiedByUs=0 AND id=?";
	pool.query(sql, [req.body.id], function(err, results){
		if(err) return res.send(err);
		return res.json(results);
	});
});

app.post("/deleteListing", blockNonAdmins, async function(req, res, next){
	//get connection
	const connection = await utils.getConnection(pool);
	const query = util.promisify(connection.query).bind(connection);

	try{
		const results = await query("SELECT `id` FROM `listings` WHERE `uuid`=?;", [req.body.uuid]);
		console.log(results);

		await query("DELETE FROM `volunteers_listings` WHERE `listingId`=?;", [results[0].id]);
		await query("DELETE FROM `listings` WHERE `id`=?;", [results[0].id]);

		return res.json(results);
	}catch(err){
		res.send(err);
	}finally{
		connection.release();
	}
});


app.post("/runSQL", blockNonAdmins, function(req, res, next){
	pool.query(req.body.sql, function(err, results){
		if(err) return res.send(err);
		return res.send(results);
	});
});

//404 page
app.all("*", function(req, res, next){
	//if ajax, send message, otherwise, show page
	if (req.xhr) {
		res.statusMessage = "Not found";
		res.status(400).send("Not found");
	}else{
		return renderPage("error404")(req, res);
	}
});

//csrf errors
app.use(function (err, req, res, next) {
	if (err.code !== "EBADCSRFTOKEN") return next(err);
   
	// handle CSRF token errors here
	logger.warn("csrf failed");
	res.status(403).end();
});

app.use(function (err, req, res, next) {
	logger.error("error:");
	logger.error(err.stack);

	//if ajax, send message, otherwise, show page
	if (req.xhr) {
		res.statusMessage = "Something broke!";
		res.status(500).send("Something broke!");
	}else{
		return renderPage("error500")(req, res);
	}
});

app.listen(port, () => logger.info(`Listening at http://localhost:${port}`));

//functions run periodically
setInterval(async function(){
	logger.info("checking batch application emails");
	await NodemailerManager.sendBatchApplicationEmails()
}, settings.emailBatchCheckTime);





function renderPage(filePath){
	return function (req, res){
		let params = {
			layout: false,
			isLoggedIn: req.user !== undefined,
			isSuccessful: res.isSuccessful
		};

		if(req.csrfToken !== undefined) params.csrfToken = req.csrfToken();
		if(params.isLoggedIn){
			params.charityName = xss(req.user.charityName);
			params.firstName = xss(req.user.firstName);
			params.lastName = xss(req.user.lastName);
			params.email = xss(req.user.email);
			params.phoneNumber = xss(req.user.phoneNumber);
		}

		return res.render(filePath, params);
	};
}

function logout(logoutAnyway){
	return function (req, res, next) {

		// do not logout remember me but if not logout completely
		if (req.cookies["rememberMe"] === "true" && !logoutAnyway) {
			logger.debug("did not log out because of rememberme");
			return next();
		}


		// clear cookies
		for (let cookieName of Object.keys(req.cookies)) {
			if(cookieName === "sessionId") res.clearCookie(cookieName);
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
				req.user = undefined;
				next();
			});
		} else {
			req.user = undefined;
			// the end
			next();
		}
	};
}

function blockNonAdmins(req, res, next){
	logger.info("accessing admin pages, isAdmin=" + req.user.isAdmin);
	if(req.user.isAdmin === 1){
		return next();
	}else{
		return renderPage("error404")(req, res);
	}
}