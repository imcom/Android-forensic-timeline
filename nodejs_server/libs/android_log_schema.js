
var mongoose = require('mongoose');
exports.LOG_SCHEMA = mongoose.Schema(
    {
        date: Number,
        msg: String,
        object: String,
        pid: Number,
        level: String
    }
);

exports.log_collections = ['dmesg', 'radio', 'events', 'main', 'system'];

exports.name = "SYSLOGS";

exports.fields = ["date", "pid", "object", "msg", "level"];


