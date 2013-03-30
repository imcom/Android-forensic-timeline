
exports.EVENT_SCHEMA = {
    date: Number,
    msg: String,
    object: String,
    pid: String,
    level: String
};

exports.collections = ['dmesg', 'radio', 'events', 'main', 'system'];

exports.name = "android_log_schema";

exports.fields = ["date", "pid", "object", "msg", "level"];

var dateReduceFunction = function(key, values) {
    var content = {dates: [], msgs: [], count: 1};
    values.forEach(function(value) {
        content.dates = value.dates.concat(content.dates);
        content.msgs = value.msgs.concat(content.msgs);
        content.count += value.count;
    });
    return content;
}

/*
var aggregateByDate = {};
aggregateByDate.map = function() {
    var key = this.date;
    var value = {
        id: this.pid,
        msg: this.msg,
        is_single: 1
    };
    emit(key, value);
}
aggregateByDate.reduce = function(key, values) {
    var content = {};
    values.forEach(function(value) {
        if (content[value.id] == null) {
            content[value.id] = [];
        }
        content[value.id].push(value.msg);
    });
    return content;
}
aggregateByDate.out = {'replace':'LogsMapReduceResults'};
exports.aggregateByDate = aggregateByDate;
*/

var aggregateByObject = {};
aggregateByObject.map = function() {
    var key = this.pid;
    var value = {
        dates: [this.date],
        msgs: [this.msg],
        count: 1
    };
    emit(key, value);
}
aggregateByObject.reduce = dateReduceFunction;
aggregateByObject.out = {'replace': 'LogsMapReduceResults'};
exports.aggregateByObject = aggregateByObject;

var aggregateByPid = {}; //TODO implement this aggregation function
aggregateByPid.map = function() {
    var key = this.object;
    var value = {
        dates: [this.date],
        msgs: [this.msg],
        count: 1
    };
    emit(key, value);
}
aggregateByPid.reduce = dateReduceFunction
aggregateByPid.out = {'replace': 'LogsMapReduceResults'};
exports.aggregateByPid = aggregateByPid;













