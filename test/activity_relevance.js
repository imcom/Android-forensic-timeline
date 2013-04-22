
db.test_collection.drop();

var app_pattern = new RegExp(application_name, 'i'); // keyword is set through --eval option
var selection = {msg: app_pattern};
var cursor = db.events.find(selection, {_id: 0, level: 0});

var collection = db.getCollection(application_name);
var reference_cursor = collection.find();
var reference_data = null;
if (reference_cursor.hasNext()) reference_data = reference_cursor.next();

// define a interval in seconds for consecutive events in other logs
// time_offset is set through --eval option
//var time_offset = 5;

var map_reduce_selection = {};
var object;
var timestamp;

var map = function() {
    var key = this.date;
    var value = {};
    var temporal_reference = 0, object_reference = 0, pid_reference = 0, msg_similarity = 0, msg_difference = 0;

        var target_tokens = tokenize(this.object, this.msg);
        if (reference_data !== null) {
            if (reference_data.category[this.object] !== undefined) {
                object_reference = reference_data.category[this.object].distribute;
            }
            if (reference_data.ids.indexOf(this.pid) !== -1) {
                pid_reference = 1;
            }
            if (object_reference === 1 && pid_reference === 1) {
                var reference_tokens = reference_data[this.object].tokens;
            } else {
                var reference_tokens = [];
                for (var category in reference_data.category) {
                    if (reference_data.category.hasOwnProperty(category)) {
                        reference_data.category[category].tokens.forEach(function(token) {
                            reference_tokens.push(token); // duplicate tokens but has no effects on result
                        });
                    }
                }
            }
        } else {
            var reference_tokens = tokenize(object, msg); //FIXME format changed
            object_reference = reference_tokens.indexOf(this.object) === -1 ? 0 : 1;
            pid_reference = reference_tokens.indexOf("pid=" + this.pid) === -1 ? 0 : 1;
        }
        var tokens_common = 0;
        var tokens_unique = 0;
        //FIXME format changed
        target_tokens.forEach(function(token) {
            if (reference_tokens.indexOf(token) !== -1) {
                tokens_common += 1;
            } else {
                tokens_unique += 1;
            }
        });
        target_tokens.forEach(function(id_token) { //FIXME no ids property anymore
            if (reference_data.ids.indexOf(id_token) !== -1) {
                tokens_common += 1;
            } else {
                tokens_unique += 1;
            }
        });
        msg_similarity = tokens_common / (target_tokens[0].length + target_tokens[1].length);
        msg_difference = tokens_unique / (target_tokens[0].length + target_tokens[1].length);

    value.object = [this.object];
    value.msg = [this.msg];
    value.pid= [this.pid];
    value.score = [[temporal_reference, object_reference, pid_reference, msg_similarity, msg_difference]]; // temporal distance, object reference, pid reference, msg similarity, msg difference
    var count = {};
    count[this.object] = 1;
    value.frequency = {0: count};
    emit(key, value);
};

var reduce = function(key, values) {
    var result = {object: [], msg: [], pid: [], score: [], frequency: {}};
    values.forEach(function(value, index) {
        result.object.push(value.object[0]);
        result.msg.push(value.msg[0]);
        result.pid.push(value.pid[0]);
        var temporal_reference = 0, object_reference = 0, pid_reference = 0, msg_similarity = 0, msg_difference = 0;
        //TODO when value.object[0] is of some certain types, amplify the temporal_reference
        var time_diff = Number(timestamp) - Number(key);
        if(result.frequency[time_diff] === undefined) {
            result.frequency[time_diff] = value.frequency[0];
        } else {
            if (result.frequency[time_diff][value.object[0]] === undefined) {
                result.frequency[time_diff][value.object[0]] = value.frequency[0][value.object[0]];
            } else {
                result.frequency[time_diff][value.object[0]] += value.frequency[0][value.object[0]];
            }
        }
        temporal_reference = Math.abs(time_diff) / time_offset;
        temporal_reference = temporal_reference < 1 ? temporal_reference : 1;

        var target_tokens = tokenize(value.object[0], value.msg[0]);
        if (reference_data !== null) {
            if (reference_data.category[value.object[0]] !== undefined) {
                object_reference = reference_data.category[value.object[0]].distribute;
            }
            if (reference_data.ids.indexOf(value.pid[0]) !== -1) {
                pid_reference = 1;
            }
            if (object_reference === 1 && pid_reference === 1) {
                var reference_tokens = reference_data[value.object[0]].tokens;
            } else {
                var reference_tokens = [];
                for (var category in reference_data.category) {
                    if (reference_data.category.hasOwnProperty(category)) {
                        reference_data.category[category].tokens.forEach(function(token) {
                            reference_tokens.push(token); // duplicate tokens but has no effects on result
                        });
                    }
                }
            }
        } else {
            var reference_tokens = tokenize(object, msg); //FIXME format changed
            object_reference = reference_tokens.indexOf(value.object[0]) === -1 ? 0 : 1;
            pid_reference = reference_tokens.indexOf("pid=" + value.pid[0]) === -1 ? 0 : 1;
        }
        var tokens_common = 0;
        var tokens_unique = 0;
        target_tokens.forEach(function(token) { //FIXME format changed
            if (reference_tokens.indexOf(token) !== -1) {
                tokens_common += 1;
            } else {
                tokens_unique += 1;
            }
        });
        target_tokens.forEach(function(id_token) {
            //FIXME no ids property anymore
            if (reference_data.ids.indexOf(id_token) !== -1) {
                tokens_common += 1;
            } else {
                tokens_unique += 1;
            }
        });
        msg_similarity = tokens_common / (target_tokens[0].length + target_tokens[1].length);
        msg_difference = tokens_unique / (target_tokens[0].length + target_tokens[1].length);

        value.score[0][0] = temporal_reference;
        value.score[0][1] = object_reference;
        value.score[0][2] = pid_reference;
        value.score[0][3] = msg_similarity;
        value.score[0][4] = msg_difference;
        result.score.push(value.score[0]);
    });
    return result;
};

var finalize = function(key, reduced_value) {
    reduced_value.score.forEach(function(score, index) {
        reduced_value.score[index] = ((-1 * score[0]) + score[1] + score[2] + score[3] + (-1 * score[4])) / 5;
    });
    return reduced_value;
};

var map_reduce_options;

function doRelevanceQuery() {
    var relevance_model;

    relevance_model = db.system.mapReduce(
        map,
        reduce,
        map_reduce_options
    );

    relevance_model = db.main.mapReduce(
        map,
        reduce,
        map_reduce_options
    );
}

var record = null;
var is_finished = false;

if (cursor.hasNext()) {
    record = cursor.next();
}

while(!is_finished && record != null) {
    object = record.object;
    pid = record.pid;
    timestamp = record.date;

    if (cursor.hasNext()) {
        record = cursor.next();
        var upper_timewindow = record.date - timestamp > time_offset ? record.date : timestamp + time_offset;
        map_reduce_selection.date = {$gt: (timestamp - time_offset), $lt: upper_timewindow};
    } else { // if there is only one record, then simply use time offset for both time boundings
        var upper_timewindow = timestamp + time_offset;
        map_reduce_selection.date = {$gt: timestamp, $lt: upper_timewindow};
        is_finished = true;
    }
    map_reduce_options = {
        out: {merge: "test_collection"},
        query: map_reduce_selection,
        finalize: finalize,
        scope: {
            object: object,
            pid: pid,
            timestamp: timestamp,
            time_offset: time_offset,
            reference_data: reference_data,
            tokenize: tokenize // pass the tokenize function into map-reduce
        }
    };
    doRelevanceQuery();
}

cursor = db.test_collection.find();
while(cursor.hasNext()) {
    printjson(cursor.next());
}

