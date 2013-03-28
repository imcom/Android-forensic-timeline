
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

exports.hello = function(msg) {
    console.log(msg);
}

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

var aggregateByObject = {};
aggregateByObject.map = function() {
    var key = this.pid;
    var value = {
        date: this.date,
        msg: this.msg,
        is_single: 1
    };
    emit(key, value);
}
aggregateByObject.reduce = function(key, values) {
    var content = {};
    values.forEach(function(value) {
        if (content[value.date] == null) {
            content[value.date] = [];
        }
        content[value.date].push(value.msg);
    });
    return content;
}
aggregateByObject.out = {'replace':'LogsMapReduceResults'};
exports.aggregateByObject = aggregateByObject;

var aggregatedByPid = {}; //TODO implement this aggregation function

