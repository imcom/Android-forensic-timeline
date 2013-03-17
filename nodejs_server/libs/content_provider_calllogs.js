
var mongoose = require('mongoose');
exports.LOG_SCHEMA = mongoose.Schema(
    {
        date: String,
        duration: String,
        type: String,
        number: String,
        name: String
    }
);

exports.log_collections = ['CallLog'];

exports.name = "CP_CallLog";

exports.fields = [
    "date",
    "duration",
    "type",
    "number",
    "name"
];