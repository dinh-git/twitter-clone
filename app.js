var express = require('express');
var app = express();
app.use(express.static('html'));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('twitter-clone.db');

initDB();

app.get('/', function (req, res) {
    res.send('Hello world!');
});

app.get('/foo', function (req, res) {
    res.send('yo');
});

app.get('/list-user', function (req, res) {
    var value = "<table><tr><td>ID</td><td>UserName</td><td>FirstName</td><td>LastName</td></tr>";
    db.serialize(function () {
        db.each("SELECT rowid AS id, userName, firstName, lastName FROM Users", function (err, row) {
            value += "<tr><td>" + row.id + "</td><td>" + row.userName + "</td><td>" + row.firstName + "</td><td>" + row.lastName + "</td></tr>";
        }, function () {
            res.send(value + "</table>");
        });
    });
});

app.post('/add-user', function (req, res) {
    var userName = req.body.userName;
    if (userName.includes(" ")) {
        res.send("Username cannot contain any spaces.");
    }

    if (doesUserNameExist(userName)) {
        res.send("Username already exists");
    } else {
        var stmt = db.prepare("INSERT INTO Users VALUES (?, ?, ?)");
        stmt.run(userName, req.body.firstName, req.body.lastName);
        stmt.finalize();
        res.send("username has been added to db");
    }
});

app.post('/send-tweet', function (req, res) {
    var userName = req.body.userName;
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});


function doesUserNameExist(userName) {
    db.serialize(function () {
        db.get("SELECT userName FROM Users WHERE userName = ?", userName, function (err, row) {
            if (row) {
                return true;
            } else {
                return false;
            }
        });
    });
}


function initDB() {
    db.serialize(function () {
        /*
         * Table: Users
         *          - userName (TEXT - PRIMARY KEY)
         *          - firstName (TEXT)
         *          - lastName (TEXT)
         */
        db.run("CREATE TABLE IF NOT EXISTS Users (userName TEXT PRIMARY KEY, firstName TEXT, lastName TEXT)");

        /*
         * Table: Tweets
         *          - userName (FOREIGN KEY REFERENCES Users.userName)
         *          - tweet (TEXT)
         *          - date (Date)
         */
        db.run("CREATE TABLE IF NOT EXISTS Tweets (userName REFERENCES Users(userName), tweet TEXT, date DATETIME)");
    });
} 