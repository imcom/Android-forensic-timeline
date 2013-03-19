
exports.EVENT_SCHEMA =
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
};

exports.log_collections = ['Applications'];

exports.name = "content_provider_apps";

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

