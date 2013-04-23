/*
 *
 * database query handler
 *
 */

var mongo = require('../libs/mongo_helper.js');
var android_logs = require('../libs/android_log_schema.js');
var cp_browserhistory = require('../libs/content_provider_browserhistory.js');
var cp_browsersearches = require('../libs/content_provider_browsersearches.js');
var cp_applications = require('../libs/content_provider_applications.js');
var cp_calllogs = require("../libs/content_provider_calllogs.js");
var cp_contacts = require("../libs/content_provider_contacts.js");
var cp_mms = require("../libs/content_provider_mms.js");
var cp_sms = require("../libs/content_provider_sms.js");
var cp_services = require("../libs/content_provider_services.js");
var fs_time = require('../libs/fs_time_schema.js');
var inode_time = require('../libs/inode_time_schema.js');
var dmesg = require('../libs/dmesg_schema.js');
var temporal_info = require('../libs/temporal_info_schema.js');
var package_info = require('../libs/package_info_schema.js');

var exec = require('child_process').exec;

function do_query(req, res, type) {
    var fields = type.fields; // default all fields of the model
    var selection = JSON.parse(req.body.selection);

    if (selection !== null) {
        selection['object'] = {$not: new RegExp(selection['object'], 'i')};
        if (selection['$or'] !== undefined) {
            selection['$or'][0].object = new RegExp(selection['$or'][0].object, 'i');
            selection['$or'][1].msg = new RegExp(selection['$or'][1].msg, 'i');
        }
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

exports.delta_timeline = function(req, res) {
    console.log("query delta time timeline for events like:" + req.body.selection);
    var command = "mongo localhost:27017/imcom --quiet --eval 'var keywords = \"" + req.body.selection + "\"'" + " ./libs/delta_timeline.js ";
    var child_process = exec(
        command,
        { maxBuffer: 1000*1024 },
        function(error, stdout, stderr) {
            if (error === null) {
                res.json({"error": 0, "type": "delta time distribution", "content": stdout});
            } else {
                console.log(error);
                res.json({"error": 1, "type": "delta time distribution", "content": error});
            }
        });
}

exports.service_info = function(req, res) {
    console.log("fetch service info of the app:" + req.body.selection);
    var command = "mongo localhost:27017/imcom --quiet --eval 'var application_name = \"" + req.body.selection + "\"'" + " ./libs/service_info.js ";
    var child_process = exec(
        command,
        function(error, stdout, stderr) {
            if (error === null) {
                res.json({"error": 0, "type": "service info", "content": stdout});
            } else {
                res.json({"error": 1, "type": "service info", "content": error});
            }
        });
}

exports.file_activity = function(req, res) {
    console.log("fetch file activity of the app:" + req.body.selection);
    var command = "mongo localhost:27017/imcom --quiet --eval 'var application_name = \"" + req.body.selection + "\"'" + " ./libs/file_activity.js ";
    var child_process = exec(
        command,
        function(error, stdout, stderr) {
            if (error === null) {
                res.json({"error": 0, "type": "file activity", "content": stdout});
            } else {
                res.json({"error": 1, "type": "file activity", "content": error});
            }
        });
}

exports.application_trace = function(req, res) {
    console.log("trace application:" + req.body.selection);
    var command = "mongo localhost:27017/imcom --quiet ./libs/app_traces.js";
    var child_process = exec(
        command,
        { maxBuffer: 1000*1024 },
        function(error, stdout, stderr) {
            if (error === null) {
                res.json({"error": 0, "type": "android_logs", "content": stdout});
            } else {
                res.json({"error": 1, "type": "android_logs", "content": error});
            }
        });
}
/*
exports.application_trace = function(req, res) {
    console.log("trace application:" + req.body.selection);
    var command = "mongo localhost:27017/imcom --quiet --eval 'var application_name = \"" + req.body.selection + "\"'" + " ./libs/trace_app.js ";
    var child_process = exec(
        command,
        function(error, stdout, stderr) {
            if (error === null) {
                res.json({"error": 0, "type": "android_logs", "content": stdout});
            } else {
                res.json({"error": 1, "type": "android_logs", "content": error});
            }
        });
}
*/
exports.dmesg_aggregation = function(req, res) {
    console.log("mapreduce on[dmesg]:" + req.body.selection);
    mongo.aggregateDmesg(req, res);
}

exports.mapreduce = function(req, res) {
    console.log("mapreduce on[" + req.body.collection + "] by {" + req.body.aggregation + "}:" + req.body.selection);
    mongo.mapreduce(req, res);
}

exports.android_logs = function(req, res) {
    console.log("query on[" + android_logs.name + "]: " + req.body.selection);
    do_query(req, res, android_logs);
};

exports.cp_browserhistory = function(req, res) {
    console.log("query on[" + cp_browserhistory.name + "]: " + req.body.selection);
    do_query(req, res, cp_browserhistory);
}

exports.cp_browsersearches = function(req, res) {
    console.log("query on[" + cp_browsersearches.name + "]: " + req.body.selection);
    do_query(req, res, cp_browsersearches);
}

exports.cp_applications = function(req, res) {
    console.log("query on[" + cp_applications.name + "]: " + req.body.selection);
    do_query(req, res, cp_applications);
}

exports.cp_calllogs = function(req, res) {
    console.log("query on[" + cp_calllogs.name + "]: " + req.body.selection);
    do_query(req, res, cp_calllogs);
}

exports.cp_contacts = function(req, res) {
    console.log("query on[" + cp_contacts.name + "]: " + req.body.selection);
    do_query(req, res, cp_contacts);
}

exports.cp_services = function(req, res) {
    console.log("query on[" + cp_services.name + "]: " + req.body.selection);
    do_query(req, res, cp_services);
}

exports.cp_mms = function(req, res) {
    console.log("query on[" + cp_mms.name + "]: " + req.body.selection);
    do_query(req, res, cp_mms);
}

exports.cp_sms = function(req, res) {
    console.log("query on[" + cp_sms.name + "]: " + req.body.selection);
    do_query(req, res, cp_sms);
}

exports.fs_time = function(req, res) {
    console.log("query on[" + fs_time.name + "]: " + req.body.selection);
    do_query(req, res, fs_time);
}

exports.inode_time = function(req, res) {
    console.log("query on[" + inode_time.name + "]: " + req.body.selection);
    do_query(req, res, inode_time);
}

exports.dmesg = function(req, res) {
    console.log("query on[" + dmesg.name + "]: " + req.body.selection);
    do_query(req, res, dmesg);
}

exports.temporal_info = function(req, res) {
    console.log("query on[" + temporal_info.name + "]: " + req.body.selection);
    do_query(req, res, temporal_info);
}

exports.package_info = function(req, res) {
    console.log("query on[" + package_info.name + "]: " + req.body.selection);
    do_query(req, res, package_info);
}












