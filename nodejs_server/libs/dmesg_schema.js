

exports.EVENT_SCHEMA =
{
    event: String,
    date: Number
};

exports.collections = ['dmesg'];

exports.name = "dmesg_schema";

exports.fields = [
    "event",
	"date"
];

var aggregate = {};
aggregate.map = function() {
    var key = this.event.split(":", 1)[0];
    var value = {
        date: [this.date],
        count: [1],
        msg: [this.event.substring(this.event.indexOf(":") + 1).trim()]
    };
    emit(key, value);
};
aggregate.reduce = function(key, values) {
    var result = {date: [], count: [], msg: []};
    values.forEach(function(value, index) {
        if (result.date.indexOf(value.date) == -1) {
            result.date.push(value.date[0]);
            result.count.push(value.count[0]);
        } else {
            result.count[index] += value.count[0];
        }
        result.msg.push(value.msg[0]);
    });
    return result;
};
aggregate.finalize = function(key, value) {
    var final_result = {};
    for (var i = 0; i < value.date.length; ++i) {
        if (!final_result.hasOwnProperty(value.date[i])) {
            final_result[value.date[i]] = {};
            final_result[value.date[i]].count = value.count[i];
            final_result[value.date[i]].content = [];
            final_result[value.date[i]].content.push(value.msg[i]);
        } else {
            final_result[value.date[i]].count += value.count[i];
            final_result[value.date[i]].content.push(value.msg[i]);
        }
    }
    return final_result;
};
aggregate.out = {"replace": "dmesg_aggregation"};

exports.aggregate = aggregate;


