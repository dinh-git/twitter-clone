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
    var userName = req.cookies.userName;
    console.log("userName: " + userName);
    if (userName == null) {
        res.redirect('/login.html');
    } else {
        res.redirect('/default.html');
    }
    
});

app.get('/list-user', function (req, res) {
    dbManager.getAllUsers(function (users) {
        res.json(users);
    });
});

app.get('/view-tweets', function (req, res) {
    var userName = req.cookies.userName;
    if (userName == null) {
        console.log("cannot find any userName from cookie");
        res.json({error: "no userName is found from cookies"});
    } else {
        dbManager.getAllTweet(userName, function (tweets) {
            res.json(tweets);
        });
    }
});

app.post('/login', function (req, res) {
    var userName = req.body.userName;
    dbManager.doesUserExist(userName, function (user) {
        console.log(userName, user);
        if (user) {
            res.cookie('userName', userName);
            res.cookie('userFullName', user.firstName + " " + user.lastName);
            console.log(userName + " is logged in");
            res.json({userName: user});
        } else {
            console.log("user is not found");
            res.json({ error: "User is not found" });

        }
    });
});

app.all("/logout", function(req, res) {
    res.clearCookie("userName");
    //res.json({result: "cookie has been cleared"});
    console.log("user is logged out");
    res.redirect('/login.html');
});

app.all("/default", function(req, res) {
    var userName = req.cookies.userName;
    if (userName == null) {
        res.json({error: "no userName is found from cookies"});
    } else {
        res.json({userName: userName});
    }
});

app.all("/followClicked", function(req, res) {
    var id = req.body.id;
    console.log("Back-end console says: 'Follow icon clicked!'");
    res.json({message: "Back-end console says: 'Follow icon id #"+id+" clicked!'"})
});

app.all("/likeClicked", function(req, res) {
    var id = req.body.id;
    console.log("Back-end console says: 'Like icon clicked!'");
    res.json({message: "Back-end console says: 'Like icon id #"+id+" clicked!'"})
});

app.post('/add-user', function (req, res) {
    var userName = req.body.userName;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    dbManager.doesUserExist(userName, function (user) {
        if (user) {
            res.json({ error: "user already exists in database" });
        } else {
            dbManager.insertUser(userName, firstName, lastName, function (success) {
                if (success) {
                    res.json({ result: "successful" });
                } else {
                    res.json({ error: "error encounted" });
                }
            });
        }
    });
});

app.post('/send-tweet', function (req, res) {
    var userName = req.cookies.userName;
    if (userName == null) {
        console.log("cannot find any userName from cookie");
        res.json({error: "no userName is found from cookies"});
    } else {
        var content = req.body.content;
        dbManager.insertTweet(userName, content, function (success) {
            if (success) {
                res.json({ result: "successful" });
            } else {
                res.json({ error: "error encounted" });
            }
        });
    }
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});