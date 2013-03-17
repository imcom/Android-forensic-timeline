
var db_name = process.argv[2];
var collection_names = process.argv[3].split(",");

var mongoose = require('mongoose');
var android_log = require("../nodejs_server/libs/android_log_schema.js");
var cp_applications = require("../nodejs_server/libs/content_provider_apps.js");
var fs_time = require("../nodejs_server/libs/fs_time_schema.js");
var inode_time = require("../nodejs_server/libs/inode_time_schema.js");
var cp_browserhistory = require("../nodejs_server/libs/content_provider_browserhistory.js");
var cp_browsersearches = require("../nodejs_server/libs/content_provider_browsersearches.js");
var cp_calllogs = require("../nodejs_server/libs/content_provider_calllogs.js");
var cp_contacts = require("../nodejs_server/libs/content_provider_contacts.js");
var cp_mms = require("../nodejs_server/libs/content_provider_mms.js");
var cp_sms = require("../nodejs_server/libs/content_provider_sms.js");
var cp_services = require("../nodejs_server/libs/content_provider_services.js");

mongoose.connect('mongodb://localhost/' + db_name);

var schemas = [
    android_log,
    cp_applications, 
    fs_time, 
    inode_time,
    cp_browserhistory,
    cp_browsersearches,
    cp_calllogs,
    cp_contacts,
    cp_mms,
    cp_sms,
    cp_services
];

schemas.forEach(function(schema){
    schema.log_collections.forEach(function(collection) {
        mongoose.model(collection, schema.LOG_SCHEMA, collection);
    });
});

var total = collection_names.length;
var counter = 0;

results = [];
collection_names.forEach(function(cname, index) {
    var model = mongoose.model(cname);
    if (model) {
        model.findOne(null, null, null, function(err, res) {
            if (err == null) {
                results[index] = res;
                counter += 1;
            } else {
                console.log(err.message);
                counter += 1;
            }
            if (counter == total) onCompletion();
        });
    } else {
        console.log("model is not set");
        counter += 1;
    }
});

function onCompletion() {
    console.log(results);
    mongoose.disconnect();
}


