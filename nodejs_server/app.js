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

/*
 *  Init MongoDB connection and models
 */
mongoose.connect('mongodb://localhost/' + db_name);

var LOG_SCHEMA = mongoose.Schema(
    {
        date: Number,
        msg: String,
        object: String,
        pid: String,
        level: String
    }
);

var log_collections = ['dmesg', 'radio', 'events', 'main', 'system'];

log_collections.forEach( function(collection) {
    mongoose.model(collection, LOG_SCHEMA, collection);
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
        '/js/d3.js',
        '/js/zepto.min.js',
        '/js/bootstrap.min.js',
        '/js/timeline.js',
    ]
});

// default index route
app.get('/', index_handler.imcom);

//TODO using `post` instead for complex query options
app.post('/query', db_handler.db_helper);

app.listen(app.get('port'));
console.log("server started on port 2222...");

/*
mongo.read("imcom", "radio", function(result){
    console.log("radio records #:" + result[result.length-1]);
});
*/







