/*
 *
 * Forensic timeline analysis
 *
 */

var db_name = process.argv[2];
var express = require('express');
var stylus = require('stylus');
var nib = require('nib');
var path = require('path');
var index_handler = require('./routes');
var db_handler = require('./routes/database');
var mongoose = require('mongoose');
var android_log = require('./libs/android_log_schema.js');
var fs_time = require("../nodejs_server/libs/fs_time_schema.js");
var inode_time = require("../nodejs_server/libs/inode_time_schema.js");
var cp_applications = require("../nodejs_server/libs/content_provider_apps.js");
var cp_browserhistory = require("../nodejs_server/libs/content_provider_browserhistory.js");
var cp_browsersearches = require("../nodejs_server/libs/content_provider_browsersearches.js");
var cp_calllogs = require("../nodejs_server/libs/content_provider_calllogs.js");
var cp_contacts = require("../nodejs_server/libs/content_provider_contacts.js");
var cp_mms = require("../nodejs_server/libs/content_provider_mms.js");
var cp_sms = require("../nodejs_server/libs/content_provider_sms.js");
var cp_services = require("../nodejs_server/libs/content_provider_services.js");
var temporal_info = require("../nodejs_server/libs/temporal_info_schema.js");

/*
 *  Init MongoDB connection and models
 */
mongoose.connect('mongodb://localhost/' + db_name);

// init models for android logs
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
    temporal_info
];

schemas.forEach(function(schema){
    schema.log_collections.forEach(function(collection) {
        mongoose.model(collection, schema.LOG_SCHEMA, collection);
    });
});

// obtain express instance
var app = express();

// using stylus for CSS generation
function compile(str, path) {
    return stylus(str).set('filename', path).set('compress', true).use(nib());
};

// express server config
app.configure(function(){
    app.set('port', process.env.PORT || 2222);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(require('stylus').middleware(
            {
                src: path.join(__dirname, 'public'),
                compile: compile
            }
        )
    );
    app.use(express.static(path.join(__dirname, 'public')));
    app.locals.globalScripts = [
        '/js/jquery-1.9.1.min.js',
        '/js/d3.js',
        '/js/zepto.min.js',
        '/js/bootstrap.min.js',
        '/js/timeline.js',
        '/js/opentip-jquery.min.js'
    ]
});

// default index route
app.get('/', index_handler.imcom);
app.post('/syslogs', db_handler.syslogs);
app.post('/cp_browserhistory', db_handler.cp_browserhistory);
app.post('/cp_browsersearches', db_handler.cp_browsersearches);

app.listen(app.get('port'));
console.log("server started on port 2222...");

/*
mongo.read("imcom", "radio", function(result){
    console.log("radio records #:" + result[result.length-1]);
});
*/







