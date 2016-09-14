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
// <<<<<<< HEAD
//     var userName = req.cookies.userName;
//     if (userName == null) {
//         console.log("cannot find any userName from cookie");
//         res.json({ error: "no userName is found from cookies" });
//     } else {
//         // dbManager.getAllTweet(userName, function (tweets) {
//         dbManager.getAllTweet(function (tweets) {
//             res.json(tweets);
//             console.log(tweets);
//         });
//     }
// =======
    dbManager.getAllTweet(function (tweets) {
        res.json(tweets);
    });
});

app.get("/userfeed/:userName", function (req, res) {
    var userName = req.params.userName;
    dbManager.getUserTweet(userName, function (tweets) {
        res.json(tweets);
    });
//>>>>>>> 7d67a8de3afd5a5bbdb72438b67b79d74ddfad70
});

app.post('/login', function (req, res) {
    var userName = req.body.userName;
    dbManager.doesUserExist(userName, function (user) {
        console.log(userName, user);
        if (user) {
            res.cookie('userName', userName);
            res.cookie('userFullName', user.firstName + " " + user.lastName);
            console.log(userName + " is logged in");
            res.json({ userName: user });
        } else {
            console.log("user is not found");
            res.json({ error: "User is not found" });

        }
    });
});

app.all("/logout", function (req, res) {
    res.clearCookie("userName");
    //res.json({result: "cookie has been cleared"});
    console.log("user is logged out");
    res.redirect('/login.html');
});

app.all("/default", function (req, res) {
    var userName = req.cookies.userName;
    if (userName == null) {
        res.json({ error: "no userName is found from cookies" });
    } else {
        res.json({ userName: userName });
    }
});

app.all("/list-following", function (req, res) {
    var userName = req.cookies.userName;
    dbManager.getAllFollowing(userName, function (rows) {
        res.json(rows);
    });
});

app.get("/follow/:followingUserName", function (req, res) {
    var userName = req.cookies.userName;
    if (userName) {
        var followingUserName = req.params.followingUserName;
        dbManager.doesUserExist(followingUserName, function (user) {
            if (user) {
                dbManager.followUser(userName, followingUserName, function (success) {
                    if (success) {
                        res.json({ message: "success" });
                    }
                });
            } else {
                res.json({ error: "User " + followingUserName + " is not found" });
            }
        });
    } else {
        res.json({ error: "userName is not found from cookies" });
    }
});

app.get("/unfollow/:followingUserName", function (req, res) {
    var userName = req.cookies.userName;
    if (userName) {
        var followingUserName = req.params.followingUserName;
        dbManager.unfollowUser(userName, followingUserName, function (success) {
            if (success) {
                res.json({ message: "success" });
            }
        });
    } else {
        res.json({ error: "userName is not found from cookies" });
    }
});

app.get("/like/:tweetId", function (req, res) {
    console.log("/like/:tweetId is triggered!");
    var userName = req.cookies.userName;
    console.log("userName: "+userName);
    if (userName) {
        var tweetId = req.params.tweetId;
        console.log("tweetId: "+tweetId);
        dbManager.getTweetById(tweetId, function (rows) {
            console.log("rows.length: "+rows.length);
            if (rows.length > 0) {
                dbManager.likeTweet(userName, tweetId, function (success) {
                    console.log("Result: "+success);
                    if (success) {
                        console.log("sending message is liked via JSON");
                        res.json({ message: "liked" });
                    } else {
                        console.log("sending error message via JSON");
                        res.json({ error: "cannot find any tweet with id " + tweetId });
                    }
                });
            } else {
                res.json({ error: "cannot find any tweet with id " + tweetId });
            }
        });
    } else {
        res.json({ error: "userName is not found from cookies" });
    }

    //res.json({ error: "something is wrong" });
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
        res.json({ error: "no userName is found from cookies" });
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