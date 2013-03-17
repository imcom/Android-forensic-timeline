/*
 *
 * database query handler
 *
 */

var mongo = require('../libs/mongo_helper.js');
var android_log = require('../libs/android_log_schema.js');
var cp_browserhistory = require('../libs/content_provider_browserhistory.js');
var cp_browsersearches = require('../libs/content_provider_browsersearches.js');

function do_query(req, res, type) {
    var fields = type.fields; // default all fields of the model
    var selection = null;

    if (req.body.fields == null) {
        fields = req.body.fields.filter(function(item) {
            return (type.fields.indexOf(item) != -1);
        });
    }

    if (req.body.selection != null) {
        selection = JSON.parse(req.body.selection);
    }

    mongo.read(
        req.body.collection,
        selection,
        fields.join(" "),
        req.body.options,
        function(result) {
            if (!result) {
                res.json({"error": 1, "type": type.name, "content": "query returned null"});
            } else {
                res.json({"error": 0, "type": type.name, "content": result});
            }
        }
    );
}

exports.syslogs = function(req, res) {
    console.log("query selection[" + android_log.name + "]: " + req.body.selection);
    do_query(req, res, android_log);
};

exports.cp_browserhistory = function(req, res) {
    console.log("query selection[" + cp_browserhistory.name + "]: " + req.body.selection);
    do_query(req, res, cp_browserhistory);
}

exports.cp_browsersearches = function(req, res) {
    console.log("query selection[" + cp_browsersearches.name + "]: " + req.body.selection);
    do_query(req, res, cp_browsersearches);
}


