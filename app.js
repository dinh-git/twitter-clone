var express = require('express');
var cookieParser = require('cookie-parser')
var fs = require('fs');
var app = express();
app.use(cookieParser());
var dbManager = require("./DbManager.js");

app.use(express.static('html'));
app.use(express.static('img'));
app.use(express.static('js'));
app.use(express.static('css'));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

dbManager.init();

app.get('/', function (req, res) {
    console.log("redirecting to index.html (GET)...");
    res.redirect('index.html');
});

app.get('/list-user', function (req, res) {
    dbManager.getAllUsers(function (users) {
        var value = "";
        for (var user of users) {
            value += user.userName;
        }
        res.send(value);
    });
});

app.get('/view-tweets', function (req, res) {
    var userName = req.cookies.userId;
    if (userName === undefined) {
        console.log("cannot find any userName from cookie");
    } else {
        dbManager.getAllTweet(userName, function (tweets) {
            var value = "";
            for (var tweet of tweets) {
                value += tweet.userName + " - " + tweet.content + "<br />";
            }
            res.send(value);
        });
    }
});

app.post('/login', function (req, res) {
    console.log("got it");
    var userName = req.body.userName;
    dbManager.doesUserExist(userName, function (user) {
        if (user) {
            res.cookie('userName', userName);
            res.cookie('userFullName', user.firstName + " " + user.lastName);
            res.send(user.firstName + " " + user.lastName)
            console.log("user is logged in");
        } else {
            console.log("user is not found");
            res.send("no user found");
        }
    });
});

app.post('/add-user', function (req, res) {
    var userName = req.body.userName;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    dbManager.doesUserExist(userName, function (user) {
        if (user) {
            res.send("user already exists in database");
        } else {
            dbManager.insertUser(userName, firstName, lastName, function (success) {
                if (success) {
                    res.send("successfully added user with username " + userName);
                } else {
                    res.send("encounted error while inserting user with username " + userName);
                }
            });
        }
    });
});

app.post('/send-tweet', function (req, res) {
    var userName = req.cookies.userName;
    if (userName === undefined) {
        console.log("cannot find any userName from cookie");
    } else {
        var content = req.body.content;
        dbManager.insertTweet(userName, content, function (success) {
            if (success) {
                res.send("successfully sent tweet");
            } else {
                res.send("encounted error while sending tweet");
            }
        });
    }
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});