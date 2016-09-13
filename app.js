var express = require('express');
var fs = require('fs');
var app = express();
var dbManager = require("./DbManager.js");

app.use(express.static('html'));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var cHome;

fs.readFile('home.txt', 'utf8', function read(err, data) {
    if (err) {
        throw err;
    }
    //console.log(data);
    cHome = data;
});


app.get('/', function (req, res) {
    res.send(cHome);
});

app.get('/list-user', function (req, res) {
});

app.get('/view-tweets', function (req, res) {
});

app.post('/login', function (req, res) {
    var userName = req.body.userName;
    dbManager.doesUserExist(userName, function (user) {
        res.cookie('loggedUserId', user.id);
        res.cookie('userFullName', user.firstName + " " + user.lastName);
        res.send(user.firstName + " " + user.lastName)
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