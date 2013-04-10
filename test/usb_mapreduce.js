

var cursor;
var model;
var selection;

var selection = {event: new RegExp('.*usb.*', 'i')};

var map = function() {
    var key = this.event.split(":", 1)[0];
    var value = {
        date: [this.date],
        count: [1],
        msg: [this.event.substring(this.event.indexOf(":") + 1).trim()]
    };
    emit(key, value);
};

var reduce = function(key, values) {
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

var finalize = function(key, value) {
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

model = db.dmesg.mapReduce(
    map,
    reduce,
    {
        out: "usb_connection",
        query: selection,
        finalize: finalize
    }
);

print("Created `usb_connection` collection");

function displayResult(cursor) {
    cursor = model.find();
    while(cursor.hasNext()) {
        var record = cursor.next();
        printjson(record);
    }
}







