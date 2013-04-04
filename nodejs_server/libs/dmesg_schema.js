

exports.EVENT_SCHEMA =
{
    event: String,
    date: Number
};

exports.collections = ['dmesg'];

exports.name = "dmesg_schema";

exports.fields = [
    "event",
	"date"
];