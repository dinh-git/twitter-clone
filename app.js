var express = require('express');
var fs = require('fs');
var app = express();
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

app.get('/', function (req, res) {
    console.log("redirecting to index.html (GET)...");
    res.redirect('index.html');
});

app.get('/list-user', function (req, res) {
});

app.get('/view-tweets', function (req, res) {
});

app.post('/login', function (req, res) {
    console.log("got it");
    var userName = req.body.userName;
    dbManager.doesUserExist(userName, function (user) {
        if (user) {
            res.cookie('userId', user.id);
            res.cookie('userFullName', user.firstName + " " + user.lastName);
            res.send(user.firstName + " " + user.lastName)
            console.log("user is logged in");
        }
        else {
            console.log("user is not found");
            res.send("no user found");
        }
    });
});

app.post('/add-user', function (req, res) {
});

app.post('/send-tweet', function (req, res) {
    var userId = req.cookies.userId;
    if (userId === undefined) {
        console.log("cannot find any userId from cookie");
    } else {

    }
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});