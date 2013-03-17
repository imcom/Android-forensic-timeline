
var db_name = process.argv[2];
var collection_name = process.argv[3];

var fields = "";
var selection = "";

var mongoose = require('mongoose');
var android_log = require("../nodejs_server/libs/android_log_schema.js");
var cp_applications = require("../nodejs_server/libs/content_provider_apps.js");

mongoose.connect('mongodb://localhost/' + db_name);

var schemas = [android_log, cp_applications];

schemas.forEach(function(schema){
    schema.log_collections.forEach(function(collection) {
        mongoose.model(collection, schema.LOG_SCHEMA, collection);
    });
});

var model = mongoose.model(collection_name);

if (model) {
    model.findOne(selection, fields, null, function(err, res) {
        if (err == null) {
            console.log(res);
        } else {
            console.log(err.message);
        }
        onCompletion();
    });
} else {
    console.log("model is not set");
    onCompletion();
}

function onCompletion() {
    mongoose.disconnect();
}
