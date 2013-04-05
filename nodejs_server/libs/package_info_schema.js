


exports.EVENT_SCHEMA =
{
    path: String,
    name: String,
    uid: String,
    gid: String,
};

exports.collections = ['packages'];

exports.name = "package_info_schema";

exports.fields = [
    "path", "name", "uid", "gid"
];
