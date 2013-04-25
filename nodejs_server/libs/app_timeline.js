
var cursor;

//cursor = db.temporal.find();

//var boot_time = cursor.next().btime;
var anchor_time = 1365512764;

cursor = db.events.find({object: new RegExp(keywords, 'i'), date: {$gt: anchor_time}}, {_id: 0, level: 0}); // am_.*

// key: delta-time, value: {object: {pids: [pid,], messages: [msg,], count: number}}
var delta_dataset = {};

/*
[
    {
        key: delta-time
        values: [
            {object: object, count: number},
            ...
        ]
        content: [{pids: [], messages: []}, ...]
    }
    value index goes into content
]
*/
var rtn_dataset = [];

while(cursor.hasNext()) {
    var record = cursor.next();
    var delta_time = record.date - anchor_time;
    var event_content = {};
    event_content[record.object] = {};
    event_content[record.object].pids = [record.pid];
    event_content[record.object].messages = [record.msg];
    event_content[record.object].count = 1;

    if (delta_dataset[delta_time] === undefined) {
        delta_dataset[delta_time] = event_content;
    } else {
        if (delta_dataset[delta_time][record.object] === undefined) {
            delta_dataset[delta_time][record.object] = event_content[record.object];
        } else {
            delta_dataset[delta_time][record.object].pids.push(event_content[record.object].pids[0]);
            delta_dataset[delta_time][record.object].messages.push(event_content[record.object].messages[0]);
            delta_dataset[delta_time][record.object].count += 1;
        }
    }
}

var rtn_dataset_buf = {};
for (var delta_time in delta_dataset) {
    if (delta_time === undefined) {
        continue;
    }
    for (var object in delta_dataset[delta_time]) {
        if (object === undefined) continue;
        if (rtn_dataset_buf[delta_time] === undefined) {
            rtn_dataset_buf[delta_time] = {delta_time: delta_time, values: [], content: []};
        }
        var value = {};
        value.object = object;
        value.count = delta_dataset[delta_time][object].count;
        rtn_dataset_buf[delta_time].values.push(value);
        var content = {};
        content.pids = delta_dataset[delta_time][object].pids;
        content.messages = delta_dataset[delta_time][object].messages;
        rtn_dataset_buf[delta_time].content.push(content);
    }
}

for (var delta_time in rtn_dataset_buf) {
    if (delta_time === undefined) continue;
    rtn_dataset.push(rtn_dataset_buf[delta_time]);
}

printjson({anchor_time: anchor_time, dataset: rtn_dataset});






