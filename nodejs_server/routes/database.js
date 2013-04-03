/*
 *
 * database query handler
 *
 */

var mongo = require('../libs/mongo_helper.js');
var android_log = require('../libs/android_log_schema.js');
var cp_browserhistory = require('../libs/content_provider_browserhistory.js');
var cp_browsersearches = require('../libs/content_provider_browsersearches.js');
var fs_time = require('../libs/fs_time_schema.js');

function do_query(req, res, type) {
    var fields = type.fields; // default all fields of the model
    var selection = JSON.parse(req.body.selection);

    if (selection != null) {
        selection['$or'][0].object = new RegExp(selection['$or'][0].object, 'i');
        selection['$or'][1].msg = new RegExp(selection['$or'][1].msg, 'i');
    }

    mongo.read(
        req.body.collection,
        selection,
        fields.join(" "),
        req.body.options, // no options needed...
        function(result) { // on success
            if (!result) {
                res.json({"error": 0, "type": type.name, "content": "result is empty"});
            } else {
                res.json({"error": 0, "type": type.name, "content": result});
            }
        },
        function(err) { // on failure
            res.json({"error": 1, "type": type.name, "content": err});
        }
    );
}

exports.mapreduce = function(req, res) {
    console.log("mapreduce on[" + req.body.collection + "] by {" + req.body.aggregation + "}:" + req.body.selection);
    mongo.mapreduce(req, res);
}

exports.android_logs = function(req, res) {
    console.log("query on[" + android_log.name + "]: " + req.body.selection);
    do_query(req, res, android_log);
};

exports.cp_browserhistory = function(req, res) {
    console.log("query on[" + cp_browserhistory.name + "]: " + req.body.selection);
    do_query(req, res, cp_browserhistory);
}

exports.cp_browsersearches = function(req, res) {
    console.log("query on[" + cp_browsersearches.name + "]: " + req.body.selection);
    do_query(req, res, cp_browsersearches);
}

exports.fs_time = function(req, res) {
    console.log("query on[" + fs_time.name + "]: " + req.body.selection);
    do_query(req, res, fs_time);
}

