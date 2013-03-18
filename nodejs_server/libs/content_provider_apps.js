
var mongoose = require('mongoose');
exports.LOG_SCHEMA = mongoose.Schema(
    {
        last_update_date: Number,
        data_dir: String,
        name: String,
        class_name: String,
        first_install_date: Number,
        pub_source_dir: String,
        requested_permissions: String,
        source_dir: String,
        permissions: String
    }
);

exports.log_collections = ['Applications'];

exports.name = "CP_Applications";

exports.fields = [
    "last_update_date",
    "data_dir",
    "name",
    "class_name",
    "first_install_date",
    "pub_source_dir",
    "requested_permissions",
    "source_dir",
    "permissions"
];

