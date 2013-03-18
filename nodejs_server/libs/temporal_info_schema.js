
var mongoose = require('mongoose');
exports.LOG_SCHEMA = mongoose.Schema(
    {
        btime: Number,
        uptime: Number,
        timezone: String,
        tz_offset: String,
    }
);

exports.log_collections = ['temporal'];

exports.name = "TEMPORAL_INFO";

exports.fields = [
    "btime", "timezone", "uptime", "tz_offset"
];