
var mongoose = require('mongoose');
exports.LOG_SCHEMA = mongoose.Schema(
    {
        last_activity: String,
        start_time: String,
        pid: String,
        name: String
    }
);

exports.log_collections = ['ServiceInfo'];

exports.name = "CP_ServiceInfo";

exports.fields = [
    "last_activity",
    "start_time",
    "pid",
    "name"
];