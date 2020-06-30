const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const mysql = require('mysql')
const bodyParser = require("body-parser");
const app = express();

const settings = require("./settings")

const port = process.env.PORT || 1234;

// connect to the mysql db
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'serverQueryManager',
  password: require("./data/serverQueryManagerPass"),
  database: 'cybervolunteers'
})
connection.connect()

// connections

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 

app.post("/createAccount", function(req, res, next){
  // TODO: checks if the password, name or email are real and if email is not used up
  // check if the email is already used
  connection.query('SELECT email FROM `volunteers` WHERE `email`=?;', [req.body.email], function(err, results, fields){
    if (err) return next(err);

    // if email is already used
    if(results.length != 0){
      res.statusMessage = "This email is already used";
      return res.status(400).end();
    }
    bcrypt.hash(req.body.password, settings.bcryptRounds, function(err, hash) {
      if (err) return next(err);
      // Store hash in your password DB.
      connection.query('INSERT INTO `volunteers`(firstName, lastName, email, passwordHash) VALUES (?, ?, ?, ?);', [req.body.firstName, req.body.lastName, req.body.email, hash], function (err, results, fields) {
        if (err) return next(err);
        return res.sendStatus(200);
      });
    });
  });
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));