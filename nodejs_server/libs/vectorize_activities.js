

var cursor;
var app_name_index = {};
cursor = db.app_name_index.find();
while (cursor.hasNext()) {
    var record = cursor.next();
    app_name_index[record.name] = record._id;
}

var sys_object_index = {};
cursor = db.system_object_index.find();
while (cursor.hasNext()) {
    var record = cursor.next();
    sys_object_index[record.name] = record._id;
}

var input_vectors = [];
var selection = {content: {$ne: null}};
var fields = {_id: 0};
cursor = db.application_trace.find(selection, fields);
while(cursor.hasNext()) {
    var activity = cursor.next();
    for (var process in activity.content) {
        if (process === undefined || activity.content[process].length === 0) continue;
        var vector = []; // [app_index, duration, num_events, num_sys_objs, sequence_code]
        var uniq_objs = [];
        var sys_obj_sequence = [];
        for (var index in activity.content[process]) {
            if (index === undefined) continue;
            var object = activity.content[process][index].object;
            var app_index = app_name_index[activity.name];
            var duration = 0;
            var num_events = activity.content[process].length;
            if (num_events > 1) {
                duration = activity.content[process][num_events - 1].date - activity.content[process][0].date;
            }
            var obj_index = sys_object_index[object];
            if (uniq_objs.indexOf(obj_index) === -1) uniq_objs.push(obj_index);
            var tokens = tokenize(object, activity.content[process][index].msg);
            seq_event = {name: obj_index, value: tokens};
            sys_obj_sequence.push(seq_event);
        }
        //TODO add DB oprs, ContentProvider oprs, Network oprs to vector
        //FIXME sequence code should be refined if possible
        var sequence_code = hashSequence(JSON.stringify(sys_obj_sequence));
        var num_sys_objs = uniq_objs.length;
        vector.push(app_index);
        vector.push(duration);
        vector.push(num_events);
        vector.push(num_sys_objs);
        vector.push(sequence_code);
        input_vectors.push(vector);
    }
}

// normalising the sequence code in samples
input_vectors = normalizeSequenceCode(input_vectors);

// put generated vectors into database
db.activity_vectors.save(input_vectors);

function normalizeSequenceCode(iv) {
    max_seq_code = 0;
    min_seq_code = 0;
    // finding the max & min value of sequence codes
    for (var i in iv) {
        if (i === undefined) continue;
        if (iv[i][4] > max_seq_code) max_seq_code = iv[i][4];
        if (iv[i][4] < min_seq_code) min_seq_code = iv[i][4];
    }
    // normalize the sequence code to [0, 1]
    for (var i in iv) {
        iv[i][4] = -1 + (iv[i][4] - min_seq_code) * 2 / (max_seq_code - min_seq_code);
    }
    return iv;
}

function hashSequence(sequence) { // DJB2 variance hash function
    // generate string hash for the system objects sequence
    var hash, ch;
    for (var i in sequence) {
        if (i === undefined) continue;
        ch = sequence.charCodeAt(i);
        hash = ((hash << 5) - hash) + ch; // hash * 31
        hash &= hash;
    }
    return hash;
}


