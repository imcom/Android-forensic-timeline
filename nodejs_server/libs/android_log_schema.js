
/*var mongoose = require('mongoose');
exports.LOG_SCHEMA = mongoose.Schema(
    {
        date: Number,
        msg: String,
        object: String,
        pid: String,
        level: String
    }
);*/

exports.EVENT_SCHEMA = {
    date: Number,
    msg: String,
    object: String,
    pid: String,
    level: String
};

exports.log_collections = ['dmesg', 'radio', 'events', 'main', 'system'];

exports.name = "android_log_schema";

exports.fields = ["date", "pid", "object", "msg", "level"];

exports.hello = function(msg) {
    console.log(msg);
}
