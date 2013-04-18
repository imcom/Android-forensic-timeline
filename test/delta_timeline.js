
var cursor;

cursor = db.temporal.find();

var boot_time = cursor.next().btime;

cursor = db.events.find({object: new RegExp(application_name, 'i')}, {_id: 0, level: 0}); // am_.*

// key: delta-time, value: {object: {pids: [pid,], messages: [msg,], count: number}}
var delta_dataset = {};

while(cursor.hasNext()) {
    var record = cursor.next();
    var delta_time = record.date - boot_time;
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

printjson(delta_dataset);
