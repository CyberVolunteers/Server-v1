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
const cookieParser = require('cookie-parser')

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

//set the utc timezone
const timezone = "UTC";
process.env.TZ = timezone;

//winston
const logger = require("./utils/winston");

//passport
passport.use(new LocalStrategy({usernameField: "email"},function(email, password, done) {
	const badCredentialsMessage = "We could not find a user with this username and password.";

	// find the password hash by the email
	pool.query("SELECT * FROM `volunteers` WHERE `email`=?;", [email], function(err, results){
		if(err) return done(err);

		if(results.length == 0){
			//compare a dummy password to prevent timing attacks
			bcrypt.compare("a dummy password", "$2b$12$6VcZHuw9wxuspyuTio3Yd.E1Il2rwwGzzRDiaffcucukfvNW7r4rC", function(err) {
				if(err) return done(err);
				// has not been verified
				return done(null, false, {message: badCredentialsMessage});
			});
		}else if (results.length == 1){
			bcrypt.compare(password, results[0].passwordHash, function(err, result) {
				if (err) return done(err);

				if(result === true){
					//log in
					return done(null, results[0]);
				}else{
					//has not been authenticated
					return done(null, false, {message: badCredentialsMessage});
				}
			});
		}
	});
}));

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
passport.deserializeUser(function(id, done) {
	pool.query("SELECT * FROM `volunteers` WHERE `id`=?;", [id], function(err, results){
		if(err) return done(err);
		//TODO: cache?
		done(err, results[0]);
	});
});





// connections
app.engine("hbs", exphbs( {
	extname: "hbs",
	defaultView: "index",
	layoutsDir: __dirname + "/public/",
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
app.post("/signup", function(req, res, next){
	pool.getConnection(function(err, connection) {
		if (err) return next(err);

		// check if the email is already used
		connection.query("SELECT `email` FROM `volunteers` WHERE `email`=?;", [req.body.email], function(err, results){
			if (err) {
				connection.release();
				res.statusMessage = "Bad data";
				logger.error(err.stack);
				return res.status(500).end();
			}

			// if email is already used
			if(results.length != 0){
				connection.release();
				res.statusMessage = "This email is already used";
				return res.status(400).end();
			}
			bcrypt.hash(req.body.password, settings.bcryptRounds, function(err, hash) {
				if (err) return next(err);
				// Store hash in your password DB.
				// TODO: insert the other values as well values
				connection.query("INSERT INTO `volunteers`(firstName, lastName, email, passwordHash, gender, salutation, nationality, address, postcode, city, country, phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", [req.body.firstName, req.body.lastName, req.body.email, hash, req.body.gender, req.body.salutation, req.body.nationality, req.body.address, req.body.postcode, req.body.city, req.body.country, req.body.phoneNumber], function (err) {
					connection.release();
					if (err) {
						res.statusMessage = "Bad data";
						logger.error(err.stack);
						return res.status(500).end();
					}

					return res.sendStatus(200);
				});
			});
		});
	});
});

// TODO: check if already logged in
app.post("/login", shortTermLoginRateLimit, longTermLoginRateLimit, function(req, res, next){
	//if credentials are missing
	if(!req.body.email || !req.body.password){
		res.statusMessage = "Please, enter your email and passowrd";
		return res.status(400).end();
	}

	passport.authenticate("local", (err, user, info) => {
		if(info){
			res.statusMessage = info.message;
			return res.status(400).end();
		}
		if(err) return next(err);
		// TODO: if (!user) { return res.redirect('/login'); }
		req.login(user, (err) => {
			if (err) return next(err);
			return res.sendStatus(200);
		});

	})(req, res, next);
});

//pages
app.get("/login", renderPage("login"));
app.get("/signup", renderPage("signup"));

app.get("/exampleForm", renderPage("exampleForm"));






app.use(express.static(path.join(__dirname, "public/web"))); // to serve js, html, css

// // redirect to login if not authenticated
// app.use(function(req, res, next){ 
// 	// let through if authenticated
// 	if (req.isAuthenticated()) return next();
// 	// if ajax, set send error code
// 	if (req.xhr) {
// 		return res.sendStatus(401).end();
// 	}
// 	// otherwise, return to login page
// 	return res.redirect("/login");
// });

// private pages and requests
app.get("/testPage", renderPage("testPage"));
app.get("/listingsPage", renderPage("listingsPage"));
app.get("/advancedSearch", renderPage("advancedSearch"));

app.post("/createListing", function(req, res, next){
	//TODO: check if the requesting party is a company or a person
	//TODO: test

	pool.query("INSERT INTO `listings`(timeRequirements, timeForVolunteering, placeForVolunteering, targetAudience, skills, createdDate, requirements, opportunityDesc, opportunityCategory, opportunityTitle, numOfvolunteers, lengthOfTime) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);", [req.body.timeRequirements, req.body.timeForVolunteering, req.body.placeForVolunteering, req.body.targetAudience, req.body.skills, new Date(), req.body.requirements, req.body.opportunityDesc, req.body.opportunityCategory, req.body.opportunityTitle, req.body.numOfvolunteers, req.body.lengthOfTime], function(err){
		if (err) {
			if(err.code === "ER_BAD_NULL_ERROR"){
				logger.error("Tried to put a null value");
				logger.error(err.stack);
				res.statusMessage = "Bad data";
				return res.status(500).end();
			}else{
				return next(err);
			}
		}

		return res.sendStatus(200);
	});
});

//TODO: check if it is a person or a company if the listing is accepted

app.get("/getListings", function(req, res, next){
	// TODO: if it is a company, show its own listings instead
	//TODO: sort which fields to serve
	pool.query("SELECT timeRequirements, timeForVolunteering, placeForVolunteering, targetAudience, skills, createdDate, requirements, opportunityDesc, opportunityCategory, opportunityTitle, numOfvolunteers, lengthOfTime FROM `listings`", [], function(err, results){
		if (err) return next(err);

		return res.status(200).json(results);
	});
});

// TODO: logout function
// TODO: do not send the error message to the client

app.get("/logout", logout());



//TODO: better 500 page and check for ajax
app.use(function (err, req, res, next) {
	logger.error("error:");
	logger.error(err.stack);
	res.status(500).send("Something broke!");
});

app.listen(port, () => logger.info(`Listening at http://localhost:${port}`));




function renderPage(filePath){
	return function (req, res){
		return res.render(filePath, {layout: false});
	};
}

function logout(){
	return function (req, res, next) {

		// do not logout remember me but if not logout completely
		//TODO: do client-side remember me cookie
        if (req.cookies["rememberMe"] === "true" && !req.logoutAnyway) {
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