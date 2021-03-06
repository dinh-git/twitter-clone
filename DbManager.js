var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('twitter-clone.db');

var isInit = false;

module.exports = {
    init: function () {
        if (!isInit) {
            db.serialize(function () {
                var createTablesSql = `
                    CREATE TABLE IF NOT EXISTS user (
                        userName TEXT UNIQUE,
                        firstName TEXT,
                        lastName TEXT
                    );

                    CREATE TABLE IF NOT EXISTS tweet (
                        userName TEXT,
                        content TEXT,
                        date DATETIME,
                        FOREIGN KEY (userName) REFERENCES user(userName)
                    );

                    CREATE TABLE IF NOT EXISTS followingRel2 (
                        userName TEXT,
                        followingUserName TEXT,
                        FOREIGN KEY (userName) REFERENCES user(userName),
                        FOREIGN KEY (followingUserName) REFERENCES user(userName)
                    );

                    CREATE TABLE IF NOT EXISTS likeTweetRel (
                        userName TEXT,
                        tweetId INTEGER,
                        FOREIGN KEY (userName) REFERENCES user(userName),
                        FOREIGN KEY (tweetId) REFERENCES tweet(id)
                    );
                `;
                db.exec(createTablesSql);
            });
            isInit = true;
        }
    },

    doesUserExist: function (userName, callback) {
        db.get("SELECT rowid as id, * FROM user WHERE userName = ?", userName, function (err, row) {
            if (err || row == undefined) {
                callback(null);
            } else {
                callback(row);
            }
        });
    },

    insertUser: function (userName, firstName, lastName, callback) {
        db.serialize(function () {
            var stmt = db.prepare("INSERT INTO user VALUES (?, ?, ?)");
            stmt.run(userName, firstName, lastName, function (err) { callback(!err ? true : false); });
            stmt.finalize();
        });
    },

    insertTweet: function (userName, content, callback) {
        db.serialize(function () {
            var stmt = db.prepare("INSERT INTO tweet VALUES (?, ?, ?)");
            stmt.run(userName, content, (new Date()).getTime(), function (err) { callback(!err ? true : false); });
            stmt.finalize();
        });
    },

    getUserTweet: function (userName, callback) {
        db.all("SELECT rowid as id, * FROM tweet WHERE userName = ?", userName, function (err, row) { }, function (err, rows) {
            callback(rows);
        });
    },

    getTweetById: function (tweetId, callback) {
        db.all("SELECT rowid as id, * FROM tweet WHERE id = ?", tweetId, function (err, row) { }, function (err, rows) {
            callback(rows);
        });
    },

    likeTweet: function (userName, tweetId, callback) {
        db.serialize(function () {
            var stmt = db.prepare("INSERT INTO likeTweetRel VALUES (?, ?)");
            stmt.run(userName, tweetId, function (err) { callback(!err ? true : false); });
            stmt.finalize();
        });
    },

    getAllLikes: function (userName, callback) {
        db.all("SELECT * FROM likeTweetRel as like inner join tweet as tweet on tweet.rowid = like.tweetId where like.userName = ?", userName, function (err, row) { }, function (err, rows) {
            callback(rows);
        });
    },

    getAllTweet: function (callback) {
        db.all("SELECT rowid as id, * FROM tweet", function (err, row) { }, function (err, rows) {
            callback(rows);
        });
    },

    followUser: function (userName, followingUserName, callback) {
        db.serialize(function () {
            var stmt = db.prepare("INSERT INTO followingRel2 VALUES (?, ?)");
            stmt.run(userName, followingUserName, function (err) { callback(!err ? true : false); });
            stmt.finalize();
        });
    },

    unfollowUser: function (userName, followingUserName, callback) {
        db.serialize(function () {
            var stmt = db.prepare("DELETE FROM followingRel2 WHERE userName = ? AND followingUserName = ?");
            stmt.run(userName, followingUserName, function (err) { callback(!err ? true : false); });
            stmt.finalize();
        });
    },

    getAllFollowing: function (userName, callback) {
        db.all("SELECT * FROM followingRel2 where userName = ?", userName, function (err, row) { }, function (err, rows) {
            callback(rows);
        });
    },

    getAllUsers: function (callback) {
        db.all("SELECT rowid as id, * FROM user", function (err, row) { }, function (err, rows) {
            callback(rows);
        });
    }
};