

exports.EVENT_SCHEMA =
{
    phone_number: String,
    display_name: String,
    contact_status: String,
    last_time_contacted: Number,
    email: String,
    starred: String,
    contact_status_ts: String
};

exports.collections = ['Contacts'];

exports.name = "content_provider_contacts";

exports.fields = [
    "phone_number",
    "display_name",
    "contact_status",
    "last_time_contacted",
    "email",
    "starred",
    "contact_status_ts"
];
