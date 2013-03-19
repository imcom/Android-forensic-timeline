
exports.EVENT_SCHEMA =
{
    title: String,
    url: String,
    user_entered: String,
    visits: String,
    bookmark: String,
    date: Number,
    _id: String
};

exports.log_collections = ['BrowserHistory'];

exports.name = "content_provider_browserhistory";

exports.fields = [
    "title",
    "url",
    "user_entered",
    "visits",
    "bookmark",
    "date",
    "_id"
];