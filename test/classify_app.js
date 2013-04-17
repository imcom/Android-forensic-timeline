

var cursor = db.app_related_system_calls.find({app:keyword});

var activity_groups = [];
var date_range = [9999999999, 0];
var total_events_number = 0;

function sortByWeight(x, y) {
    return x.weight > y.weight ? -1 : 1;
}

function updateDateRange(events) {
    var date;
    events.forEach(function(record) {
        date = record.date; 
        if (date < date_range[0]) date_range[0] = date;
        if (date > date_range[1]) date_range[1] = date;
    });
}

function getEventsNumberAndMessage(activity_group) {
    var count = 0;
    var messages = [];
    for (var pid in activity_group) {
        if (activity_group.hasOwnProperty(pid)) {
            count += activity_group[pid].length;
            updateDateRange(activity_group[pid]);
            activity_group[pid].forEach(function(record) {
                messages.push(record.msg); 
            });
        }
    }
    total_events_number += count;
    return [count, messages];
}

while(cursor.hasNext()) {
    var record = cursor.next();
    for (var group in record.detail) {
        if (record.detail.hasOwnProperty(group) && activity_groups.indexOf(group) === -1) {
            var detail = getEventsNumberAndMessage(record.detail[group]);
            activity_groups.push({name: group, weight: detail[0], messages: detail[1]});
        }
    }
}

activity_groups = activity_groups.sort(sortByWeight);

activity_groups.forEach(function(activity_group) {
    if (date_range[0] !== date_range[1])
        activity_group.frequency = activity_group.weight / (date_range[1] - date_range[0]);
    else
        activity_group.frequency = activity_group.weight;
    activity_group.distribute = activity_group.weight / total_events_number;
});

printjson(activity_groups);


