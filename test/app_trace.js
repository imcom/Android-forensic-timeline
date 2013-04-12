
var cursor;
cursor = db.app_related_system_calls.find({app:"com.android.mms"});

var related_tokens = [];
var activities = {};
var start_points = [];
var end_points = [];
var duration_points = [];

var process_start = "am_proc_start";
var process_end = "am_proc_died";

var detected_pids = [];

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

//start_points.sort(sortByDate);
//duration_points.sort(sortByDate);
//end_points.sort(sortByDate);

var combined_activities = start_points.concat(duration_points).concat(end_points);
var is_unknown = true;
activities.unknown = [];
duration_points = {};

combined_activities.forEach(function(activity) {
    var message = activity.msg;
    var pid;
    if (activity.object === process_start) {
        pid = message.substr(1, message.length - 1).split(',', 1);
        activities[pid] = [activity];
        duration_points[pid] = [];
        detected_pids.push(pid);
    } else if (activity.object === process_end) {
        pid = message.substr(1, message.length - 1).split(',', 1);
        if (!activities[pid]) {
            activities[pid] = [];
            duration_points[pid] = [];
        }
        activities[pid].push(activity);
    } else {
        detected_pids.forEach(function(_pid) {
            if (message.indexOf(_pid) !== -1) {
                duration_points[_pid].push(activity);
                is_unknown = false;
            } else {
                is_unknown = true;
            }
        });
        if (is_unknown) {
            activities.unknown.push(activity);
        }
    }

});

for (var _pid in duration_points) {
    if (duration_points.hasOwnProperty(_pid)) {
        cursor = db.events.find({pid: _pid, object: {$not: new RegExp('.*gc.*', 'i')}}, {_id: 0, level: 0});
        while (cursor.hasNext()) {
            duration_points[_pid].push(cursor.next());
        }
    }
}

for (var _pid in activities) {
    var index = 1;
    if (activities.hasOwnProperty(_pid) && _pid !== "unknown") {
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

printjson(activities);




