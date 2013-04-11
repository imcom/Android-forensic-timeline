
var app_pattern = new RegExp('.*tencent.*', 'i');
var selection = {msg: app_pattern};

var cursor = db.events.find(selection, {_id: 0, level: 0});

var timewindow = 10; // 5 seconds period for consecutive events in other logs
var map_reduce_selection = {};
var object;
var timestamp;

while(cursor.hasNext()) {
    var record = cursor.next();
    object = record.object;
    pid = record.pid;
    timestamp = record.date;
    map_reduce_selection.date = {$gte: record.date, $lte: (record.date + timewindow)};
}

var map = function() {
    var key = this.date;
    var value = {};
    value.object = [this.object];
    value.msg = [this.msg];
    value.pid= [this.pid];
    value.score = [0];
    emit(key, value);
};

var reduce = function(key, values) {
    var result = {object: [], msg: [], pid: [], score: []};
    //TODO consider the time diff infulence
    values.forEach(function(value, index) {
        result.object.push(value.object);
        result.msg.push(value.msg);
        result.pid.push(value.pid);
        var score = 0;
        score += Number(key) - Number(timestamp);
        score += (value.object == object ? 5 : value.pid === pid ? 2 : 0);
        score += (value.pid == pid ? 2 : 0);
        score += (app_pattern.test(value.msg) ? 5 : 0);
        result.score.push(score);
    });
    return result;
};

var finalize = function(key, reduced_value) {
    return reduced_value;
};

cursor = db.system.mapReduce(
    map,
    reduce,
    {
        out: "test_collection",
        query: map_reduce_selection,
        finalize: finalize,
        scope: {
            app_pattern: app_pattern,
            object: object,
            pid: pid,
            timestamp: timestamp
        }
    }
);

printjson(cursor.find().next());



