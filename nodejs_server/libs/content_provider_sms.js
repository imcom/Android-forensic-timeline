

exports.EVENT_SCHEMA =
{
    body: String,
    service_center: String,
    address: String,
    report_date: Number,
    cs_timestamp: Number,
    date: Number,
    type: String
};

exports.log_collections = ['SMS'];

exports.name = "content_provider_sms";

exports.fields = [
    "body",
    "service_center",
    "address",
    "report_date",
    "cs_timestamp",
    "date",
    "type"
];