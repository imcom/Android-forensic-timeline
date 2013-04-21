

var android_logs = require("./android_log_schema.js");
var cp_applications = require("./content_provider_applications.js");
var fs_time = require("./fs_time_schema.js");
var inode_time = require("./inode_time_schema.js");
var cp_browserhistory = require("./content_provider_browserhistory.js");
var cp_browsersearches = require("./content_provider_browsersearches.js");
var cp_calllogs = require("./content_provider_calllogs.js");
var cp_contacts = require("./content_provider_contacts.js");
var cp_mms = require("./content_provider_mms.js");
var cp_sms = require("./content_provider_sms.js");
var cp_services = require("./content_provider_services.js");
var dmesg = require("./dmesg_schema.js");
var temporal = require("./temporal_info_schema.js");
var mongoose = require('mongoose');

exports.aggregateDmesg = function(req, res) {
    var model = mongoose.model("dmesg");
    var obj = dmesg.aggregate;
    var selection = JSON.parse(req.body.selection);

    if (selection != null && selection.event != null) {
        selection.event = new RegExp(selection.event, 'i');
    }
    obj.query = selection;
    model.mapReduce(obj, function(err, rtn_model, stats) {
        if (err == null) {
            rtn_model.find().exec(function(err, rtn) {
                res.json({"error": 0, "type": "dmesg aggregation", "content": rtn});
            });
        } else {
            res.json({"error": 1, "type": "dmesg aggregation", "content": err.message});
        }
    });
}

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
    var obj;
    if (
        req.body.collection === 'main' ||
        req.body.collection === 'system' ||
        req.body.collection === 'events' ||
        req.body.collection === 'radio'
    ) {
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
}

