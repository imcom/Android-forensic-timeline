
var mongoose = require('mongoose');
exports.LOG_SCHEMA = mongoose.Schema(
    {
        last_update_time: String,
        data_dir: String,
        name: String,
        class_name: String,
        first_install_time: String,
        pub_source_dir: String,
        requested_permissions: String,
        source_dir: String,
        permissions: String
    }
);

exports.log_collections = ['Applications'];

exports.name = "CP_Applications";

exports.fields = [
    "last_update_time",
    "data_dir",
    "name",
    "class_name",
    "first_install_time",
    "pub_source_dir",
    "requested_permissions",
    "source_dir",
    "permissions"
];

