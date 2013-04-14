
exports.EVENT_SCHEMA =
{
    _id: Number,
    app: String,
    detail: {},
};

exports.collections = ['app_related_system_calls'];

exports.name = "app_related_system_calls";

exports.fields = [
    "_id",
    "app",
    "detail"
];