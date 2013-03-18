
var mongoose = require('mongoose');
exports.LOG_SCHEMA = mongoose.Schema(
    {
        phone_number: String,
        display_name: String,
        contact_status: String,
        last_time_contacted: Number,
        email: String,
        starred: Number,
        _id: String,
        contact_status_ts: String
    }
);

exports.log_collections = ['Contacts'];

exports.name = "CP_Contacts";

exports.fields = [
    "phone_number",
    "display_name",
    "contact_status",
    "last_time_contacted",
    "email",
    "starred",
    "_id",
    "contact_status_ts"
];