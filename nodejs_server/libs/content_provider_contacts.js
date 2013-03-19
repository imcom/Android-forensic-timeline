

exports.EVENT_SCHEMA =
{
    phone_number: String,
    display_name: String,
    contact_status: String,
    last_time_contacted: Number,
    email: String,
    starred: String,
    _id: String,
    contact_status_ts: String
};

exports.log_collections = ['Contacts'];

exports.name = "content_provider_contacts";

exports.fields = [
    "phone_number",
    "display_name",
    "contact_status",
    "last_time_contacted",
    "email",
    "starred",
    "_id",
    "contact_status_ts"
];