
var mongoose = require('mongoose');
exports.LOG_SCHEMA = mongoose.Schema(
    {
        last_activity_date: Number,
        launch_date: Number,
        pid: String,
        name: String
    }
);

exports.log_collections = ['ServiceInfo'];

exports.name = "CP_ServiceInfo";

exports.fields = [
    "last_activity_date",
    "launch_date",
    "pid",
    "name"
];