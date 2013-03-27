
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

var aggregateDate = {};
aggregateDate.map = function() {
    var key = this.date;
    var value = {
        pid: this.pid,
        msg: this.msg
    };
    emit(key, value);
}
aggregateDate.reduce = function(key, values) {
    var content = {};
    values.forEach(function(value) {
        if (content[value.pid] == null) {
            content[value.pid] = [];
        }
        content[value.pid].push(value.msg);
    });
    return content;
}
exports.aggregateDate = aggregateDate;





