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
                        FOREIGN KEY (userName) REFERENCES user(userName)
                    );

                    CREATE TABLE IF NOT EXISTS followingRel (
                        userId INTEGER,
                        followerUserId INTEGER,
                        FOREIGN KEY (followerUserId) REFERENCES user(id)
                    );

                    CREATE TABLE IF NOT EXISTS likeTweetRel (
                        userId INTEGER,
                        tweetId INTEGER,
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
    }
};