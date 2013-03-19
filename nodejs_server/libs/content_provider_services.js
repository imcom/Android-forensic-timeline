

exports.EVENT_SCHEMA =
{
    last_activity_date: Number,
    launch_date: Number,
    pid: String,
    name: String
};

exports.log_collections = ['ServiceInfo'];

exports.name = "content_provider_services";

exports.fields = [
    "last_activity_date",
    "launch_date",
    "pid",
    "name"
];