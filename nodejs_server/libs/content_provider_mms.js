
//FIXME the schema is inconsistent with acutal data in DB
exports.EVENT_SCHEMA =
{
    retr_txt: String,
    cs_timestamp: Number,
    sub: String,
    date: Number,
    read_status: String
};

exports.collections = ['MMS'];

exports.name = "content_provider_mms";

exports.fields = [
	"retr_txt",
	"cs_timestamp",
	"sub",
	"date",
	"read_status"
];
