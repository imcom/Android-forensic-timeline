

var cursor = db.app_related_system_calls.find({app:application_name});

var app_category = {name: application_name};
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

function getEventsNumberAndTokens(object, activity_group) {
    var count = 0;
    var tokens = [];
    for (var pid in activity_group) {
        if (activity_group.hasOwnProperty(pid)) {
            count += activity_group[pid].length;
            updateDateRange(activity_group[pid]);
            activity_group[pid].forEach(function(record) {
                var tokenizer_return = tokenize(object, record.msg);
                tokens = _.union(tokens, tokenizer_return);
            });
        }
    }
    total_events_number += count;
    return [count, tokens];
}

while(cursor.hasNext()) {
    var record = cursor.next();
    for (var object in record.detail) {
        if (record.detail.hasOwnProperty(object) && activity_groups.indexOf(object) === -1) {
            var detail = getEventsNumberAndTokens(object, record.detail[object]);
            activity_groups.push({name: object, weight: detail[0], tokens: detail[1]});
        }
    }
}

activity_groups = activity_groups.sort(sortByWeight);

activity_groups.forEach(function(activity_group) {
    if (date_range[0] !== date_range[1])
        activity_group.frequency = activity_group.weight / (date_range[1] - date_range[0]) * 3600; // frequency per hour
    else
        activity_group.frequency = activity_group.weight;
    activity_group.distribute = activity_group.weight / total_events_number;
});

app_category.category = {};
activity_groups.forEach(function(activity_group) {
    app_category.category[activity_group.name] = activity_group;
});

var collection = db.getCollection(application_name);
collection.drop();
collection.save(app_category);




