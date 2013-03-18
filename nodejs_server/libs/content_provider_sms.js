
var mongoose = require('mongoose');
exports.LOG_SCHEMA = mongoose.Schema(
    {
        body: String,
        service_center: String,
        address: String,
        report_date: Number,
        cs_timestamp: Number,
        date: Number,
        type: String
    }
);

exports.log_collections = ['SMS'];

exports.name = "CP_SMS";

exports.fields = [
    "body",
    "service_center",
    "address",
    "report_date",
    "cs_timestamp",
    "date",
    "type"
];