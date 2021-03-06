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
var file_system = require('fs');

var db_name = process.argv[2];
var database = "localhost:27017/" + db_name;
var exec = require('child_process').exec;

function do_query(req, res, type) {
    var fields = type.fields; // default all fields of the model
    var selection = JSON.parse(req.body.selection);

    if (selection !== null) {
        if (selection['object'] !== undefined)
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
                res.json({"error": 0, "type": type.name, "content": ""});
            } else {
                res.json({"error": 0, "type": type.name, "content": result});
            }
        },
        function(err) { // on failure
            res.json({"error": 1, "type": type.name, "content": err});
        }
    );
}

exports.upload_log = function(req, res) {
    file_system.writeFile("./uploads/main.log", req.body.main, function(err){ if(err) throw err; });
    file_system.writeFile("./uploads/system.log", req.body.system, function(err){ if(err) throw err; });
    file_system.writeFile("./uploads/events.log", req.body.events, function(err){ if(err) throw err; });
    file_system.writeFile("./uploads/radio.log", req.body.radio, function(err){ if(err) throw err; });
    file_system.writeFile("./uploads/packages.list", req.body.packages, function(err){ if(err) throw err; });
    var command = "./libs/parse_uploads.sh ./uploads ./uploads/json";
    var child_process = exec(
        command,
        function(error, stdout, stderr) {
            console.log(stdout);
            if (error === null) {
                command = "\
                    mongoimport --db imcom_som --upsert --upsertFields date,object,msg,pid --collection main --file ./uploads/json/main.log; \
                    mongoimport --db imcom_som --upsert --upsertFields date,object,msg,pid --collection system --file ./uploads/json/system.log; \
                    mongoimport --db imcom_som --upsert --upsertFields date,object,msg,pid --collection events --file ./uploads/json/events.log; \
                    mongoimport --db imcom_som --upsert --upsertFields date,object,msg,pid --collection radio --file ./uploads/json/radio.log; \
                    mongoimport --db imcom_som --upsert --upsertFields name --collection packages --file ./uploads/json/packages.list; \
                    ./libs/update_db.sh;";
                var import_process = exec(
                    command,
                    function(error, stdout, stderr) {
                        if (error === null) {
                            console.log("database has been updated");
                        } else {
                            console.log(error);
                        }
                    });
            } else {
                console.log(error);
            }
        }
    );
    res.json({error: 0, msg: 'OK'});
}

exports.token_index = function(req, res) {
    var command = "mongo localhost:27017/imcom_som --quiet ./libs/fetch_token_index.js";
    var child_process = exec(
        command,
        function(error, stdout, stderr) {
            if (error === null) {
                res.json({"error": 0, "type": "token index", "content": stdout});
            } else {
                console.log(error);
                res.json({"error": 1, "type": "token index", "content": error});
            }
        }
    );
}

exports.coords = function(req, res) {
    var command = "python ./libs/get_coords.py " + req.body.iv;
    var child_process = exec(
        command,
        function(error, stdout, stderr) {
            if (error === null) {
                // sending back the received index for pointing the correct elements in IV array
                rtn = JSON.stringify({coords:stdout, index: req.body.index, name: req.body.name});
                res.json({"error": 0, "type": "coords", "content": rtn});
            } else {
                console.log(stdout);
                console.log(error);
                res.json({"error": 1, "type": "coords", "content": error});
            }
        }
    );
}

/*exports.matrix = function(req, res) {
    var command = "mongo localhost:27017/imcom_som --quiet ./libs/fetch_covar_matrix.js";
    var child_process = exec(
        command,
        function(error, stdout, stderr) {
            if (error === null) {
                res.json({"error": 0, "type": "covariance matrix", "content": stdout});
            } else {
                console.log(error);
                res.json({"error": 1, "type": "covariance matrix", "content": error});
            }
        }
    );
}*/

exports.som = function(req, res) {
    var command = "mongo localhost:27017/imcom_som --quiet ./libs/fetch_som.js";
    var child_process = exec(
        command,
        function(error, stdout, stderr) {
            if (error === null) {
                res.json({"error": 0, "type": "SOM", "content": stdout});
            } else {
                console.log(error);
                res.json({"error": 1, "type": "SOM", "content": error});
            }
        }
    );
}

exports.delta_timeline = function(req, res) {
    console.log("generate timeline for application:" + req.body.selection);
    var command = "mongo localhost:27017/" + db_name + " --quiet --eval 'var application_name = \"" + req.body.selection + "\"'" + " ./libs/delta_timeline.js ";
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

exports.radio_activity = function(req, res) {
    console.log("fetch radio activities");
    var command = "mongo " + database + " --quiet ./libs/radio_activity.js";
    var child_process = exec(
        command,
        function(error, stdout, stderr) {
            if (error === null) {
                res.json({"error": 0, "type": "radio activity", "content": stdout});
            } else {
                res.json({"error": 1, "type": "radio activity", "content": error});
            }
        });
}

exports.service_info = function(req, res) {
    console.log("fetch service info of the app:" + req.body.selection);
    var command = "mongo localhost:27017/" + db_name + " --quiet --eval 'var application_name = \"" + req.body.selection + "\"'" + " ./libs/service_info.js ";
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
    var command = "mongo localhost:27017/" + db_name + " --quiet --eval 'var application_name = \"" + req.body.selection + "\"'" + " ./libs/file_activity.js ";
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
    console.log("query for application traces");
    var command = "mongo localhost:27017/" + db_name + " --quiet ./libs/app_traces.js";
    var child_process = exec(
        command,
        { maxBuffer: 5000*1024 },
        function(error, stdout, stderr) {
            if (error === null) {
                res.json({"error": 0, "type": "application_trace", "content": stdout});
            } else {
                console.log(error);
                res.json({"error": 1, "type": "application_trace", "content": stderr});
            }
        });
}

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












