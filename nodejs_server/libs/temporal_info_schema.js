

exports.EVENT_SCHEMA =
{
    btime: Number,
    uptime: Number,
    timezone: String,
    tz_offset: String,
};

exports.collections = ['temporal'];

exports.name = "temporal_info_schema";

exports.fields = [
    "btime", "timezone", "uptime", "tz_offset"
];