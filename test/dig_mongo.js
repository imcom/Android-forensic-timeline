
var db_name = process.argv[2];
var stylus = require('stylus');
var nib = require('nib');
var path = require('path');
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
var temporal = require("../nodejs_server/libs/temporal_info_schema.js");

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
    cp_services,
    temporal
];

schemas.forEach(function(schema){
    schema.log_collections.forEach(function(collection) {
        mongoose.model(collection, mongoose.Schema(schema.LOG_SCHEMA), collection);
    });
});

var express = require('express');
var app = express();

function compile(str, path) {
    return stylus(str).set('filename', path).set('compress', true).use(nib());
};

// express server config
app.configure(function(){
    app.set('views', path.join(__dirname, './'));
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(require('stylus').middleware(
            {
                src: path.join(__dirname, ''),
                compile: compile
            }
        )
    );
    app.use(express.static(path.join(__dirname, '')));
});

app.get('/', function(req, res){
    res.render("index");
});

// MongoDB snippet
app.post('/test', function(req, res){
    var model = mongoose.model(req.body.collection);
    model.findOne(null, null, null, function(err, rtn) {
        if (err == null) {
            res.json({"content": rtn});
        } else {
            res.json({"content": err.message});
        }
    });
});

app.listen(8080);
console.log("server started on localhost:8080 ...");

/*
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
*/

