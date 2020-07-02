const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const mysql = require('mysql')
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

app.post("/createAccount", function(req, res){
  console.log(req.body);
  // TODO: checks if the password, name or email are real and if email is not used up
  bcrypt.hash(req.body.password, settings.bcryptRounds, function(err, hash) {
    // Store hash in your password DB.
    connection.query('INSERT INTO `volunteers`(firstName, lastName, email, passwordHash) VALUES (?, ?, ?, ?);', [req.body.firstName, req.body.lastName, req.body.email, hash], function (error, results, fields) {
      if (error) throw error;
    });
  });
})

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));