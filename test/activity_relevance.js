
var app_pattern = new RegExp('.*(android.mms).*', 'i');
var selection = {msg: app_pattern};

var cursor = db.events.find(selection, {_id: 0, level: 0});

var time_offset = 5; // 5 seconds period for consecutive events in other logs
var map_reduce_selection = {};
var object;
var timestamp;

var map = function() {
    var key = this.date;
    var value = {};
    value.object = [this.object];
    value.msg = [this.msg];
    value.pid= [this.pid];
    value.score = [[0, 0, 0, 0]];
    emit(key, value);
};

var reduce = function(key, values) {
    var result = {object: [], msg: [], pid: [], score: []};
    values.forEach(function(value, index) {
        result.object.push(value.object[0]);
        result.msg.push(value.msg[0]);
        result.pid.push(value.pid[0]);
        value.score[0][0] = (Number(timestamp) - Number(key)) % time_offset;
        value.score[0][1] = (value.object[0] == object ? 1 : -1);
        value.score[0][2] = (value.pid[0] == pid ? 1 : -1);
        value.score[0][3] = (app_pattern.test(value.msg[0]) ? time_offset : 0);
        result.score.push(value.score[0]);
    });
    return result;
};

var finalize = function(key, reduced_value) {
    reduced_value.score.forEach(function(score, index) {
        reduced_value.score[index] = (score[0] + score[1] + score[2] + score[3]) / 4;
    });
    return reduced_value;
};

var map_reduce_options;

function doRelevanceQuery() {
    var relevance_model;

    relevance_model = db.system.mapReduce(
        map,
        reduce,
        map_reduce_options 
    );

    relevance_model = db.main.mapReduce(
        map,
        reduce,
        map_reduce_options 
    );
}

var record = null;
var is_finished = false;

if (cursor.hasNext()) {
    record = cursor.next();
}

while(!is_finished && record != null) {
    object = record.object;
    pid = record.pid;
    timestamp = record.date;

    if (cursor.hasNext()) {
        record = cursor.next();
        var upper_timewindow = record.date - timestamp > time_offset ? record.date : timestamp + time_offset;
        map_reduce_selection.date = {$gt: (timestamp - time_offset), $lt: upper_timewindow};
    } else { // if there is only one record, then simply use time offset for both time boundings
        var upper_timewindow = timestamp + time_offset;
        map_reduce_selection.date = {$gt: timestamp, $lt: upper_timewindow};
        is_finished = true;
    }
    map_reduce_options = {
        out: {merge: "test_collection"},
        query: map_reduce_selection,
        finalize: finalize,
        scope: {
            app_pattern: app_pattern,
            object: object,
            pid: pid,
            timestamp: timestamp,
            time_offset: time_offset
        }
    };
    doRelevanceQuery();
}


