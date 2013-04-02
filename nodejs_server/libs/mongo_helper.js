

var android_logs = require("./android_log_schema.js");
var cp_applications = require("./content_provider_apps.js");
var fs_time = require("./fs_time_schema.js");
var inode_time = require("./inode_time_schema.js");
var cp_browserhistory = require("./content_provider_browserhistory.js");
var cp_browsersearches = require("./content_provider_browsersearches.js");
var cp_calllogs = require("./content_provider_calllogs.js");
var cp_contacts = require("./content_provider_contacts.js");
var cp_mms = require("./content_provider_mms.js");
var cp_sms = require("./content_provider_sms.js");
var cp_services = require("./content_provider_services.js");
var temporal = require("./temporal_info_schema.js");
var mongoose = require('mongoose');

exports.read = function(collection, selection, fields, options, onCompletion, onFailure) {
    var model = mongoose.model(collection);

    if (model) {
        model.find(selection, fields, options, function(err, res) {
            if (err == null) {
                onCompletion(res);
            } else {
                onFailure(err.message); //TODO deal with query failures
            }
        });
    } else {
        onFailure("model is not set"); //TODO deal with if model is not set yet
    }
}

exports.mapreduce = function(req, res) {
    var model = mongoose.model(req.body.collection);
    /*if (req.body.type === 'query') {
        model.find(
            JSON.parse(req.body.selection), //selection
            req.body.fields, //fields
            null, //options
            function(err, rtn) {
                if (err == null) {
                    res.json({"type": type, "content": rtn});
                } else {
                    res.json({"content": err.message});
                }
            }
        );
    } else { // type should be mapreduce*/
    if (req.body.type === 'mapreduce') { //FIXME if statement is not necessary
        var obj;
        if (req.body.collection === 'main') {
            if (req.body.aggregation === 'object') {
                obj = android_logs.aggregateByObject;
            } else if (req.body.aggregation === 'id') {
                obj = android_logs.aggregateByPid;
            }
        }
        obj.query = JSON.parse(req.body.selection);
        model.mapReduce(obj, function(err, rtn_model, stats) {
            if (err == null) {
                rtn_model.find().exec(function(err, rtn) {
                    res.json({"error": 0, "type": req.body.collection, "content": rtn});
                });
            } else {
                res.json({"error": 1, "type": req.body.collection, "content": err.message});
            }
        });
    } // if statement
}

