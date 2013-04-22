
var cursor;
// application_name is passed from shell via mongo `--eval` option
cursor = db.app_related_system_calls.find({app:application_name});

var activities = null;
var start_points = [];
var end_points = [];
var duration_points = [];
var processes_life = {};

var process_start = "am_proc_start";
var process_end = "am_proc_died";

// separate events into start, duration and end
while (cursor.hasNext()) {
    var record = cursor.next();
    for (var object in record.detail) {
        if (record.detail.hasOwnProperty(object)) {
            for (var pid in record.detail[object]) {
                if (record.detail[object].hasOwnProperty(pid)) {
                    record.detail[object][pid].forEach(function(content, index) {
                        var activity = {};
                        activity.date = content.date;
                        activity.msg = content.msg;
                        activity.pid = pid;
                        activity.object = object;
                        if (activity.object === process_start) {
                            start_points.push(activity);
                        } else if (activity.object === process_end) {
                            end_points.push(activity);
                        } else {
                            duration_points.push(activity);
                        }
                    });
                }
            }
        }
    }
}

function sortByDate(x, y) {
    if (x.date <= y.date) return -1;
    if (x.date > y.date) return 1;
}

var combined_activities = start_points.concat(end_points).concat(duration_points); // can detect pids from start/end points
if (combined_activities.length > 0) {
    activities = {};
    activities.suspects = []; // actually the suspicious records
}
var is_suspicious = true;
duration_points = {};

// group events by its relevant process id (application)
combined_activities.forEach(function(activity) {
    var message = activity.msg;
    var pid;
    if (activity.object === process_start) {
        pid = message.substr(1, message.length - 1).split(',', 1)[0];
        activities[pid] = [activity];
        duration_points[pid] = [];
        processes_life[pid] = {};
        processes_life[pid].start = activity.date;
        processes_life[pid].end = 9999999999; // infinite of date...
    } else if (activity.object === process_end) {
        pid = message.substr(1, message.length - 1).split(',', 1)[0];
        if (activities[pid] === undefined) {
            activities[pid] = [];
            duration_points[pid] = [];
            processes_life[pid] = {};
            processes_life[pid].start = 0; // very beginning
        }
        processes_life[pid].end = activity.date;
        activities[pid].push(activity);
    } else {
        for (var _pid in processes_life) {
            is_suspicious = true;
            if (_pid === undefined) continue;
            if (activity.date >= processes_life[_pid].start && activity.date <= processes_life[_pid].end) {
                duration_points[_pid].push(activity);
                is_suspicious = false;
                break;
            }
        }
        if (is_suspicious) {
            activities.suspects.push(activity);
        }
    }
});

// finalize the result, sort events within duration group by date
for (var _pid in activities) {
    var index = 1;
    if (activities.hasOwnProperty(_pid) && _pid !== "suspects") {
        duration_points[_pid].sort(sortByDate);
        duration_points[_pid].forEach(function(record) {
            if (activities[_pid].length === 1) {
                if (activities[_pid][0].object === process_end) {
                    index = 0;
                    activities[_pid].splice(index, 0, record);
                }
            } else {
                activities[_pid].splice(index, 0, record);
            }
            index += 1;
        });
    }
}

// output json string to shell which is then piped to Node.js
if (activities !== null)
    printjson(activities);




