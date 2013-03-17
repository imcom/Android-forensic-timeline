
var mongoose = require('mongoose');
exports.LOG_SCHEMA = mongoose.Schema(
    {
        date: Number,
        search: String,
        _id: String
    }
);

exports.log_collections = ['BrowserSearches'];

exports.name = "CP_BrowserSearches";

exports.fields = [
    "date",
    "search",
    "_id"
];