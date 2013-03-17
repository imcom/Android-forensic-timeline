
var mongoose = require('mongoose');
exports.LOG_SCHEMA = mongoose.Schema(
    {
        title: String,
        url: String,
        user_entered: String,
        visits: String,
        bookmark: String,
        date: String,
        _id: String
    }
);

exports.log_collections = ['BrowserHistory'];

exports.name = "CP_BrowserHistory";

exports.fields = [
    "title",
    "url",
    "user_entered",
    "visits",
    "bookmark",
    "date",
    "_id"
];