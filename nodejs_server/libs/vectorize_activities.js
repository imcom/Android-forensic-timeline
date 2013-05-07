
// clear old collection first
db.activity_vectors.drop()

var cursor;
/*var app_name_index = {};
cursor = db.app_name_index.find();
while (cursor.hasNext()) {
    var record = cursor.next();
    app_name_index[record.name] = record._id;
}*/

var sys_object_index = {};
cursor = db.system_object_index.find();
while (cursor.hasNext()) {
    var record = cursor.next();
    sys_object_index[record.name] = record._id;
}

var token_index = []; // [ {`hash`: token_hash, `value`: tokens}, ... ]
var sorted_token_hash = []; // same structure as above

var input_vectors = [];
var selection = {content: {$ne: null}};
var fields = {_id: 0};
cursor = db.application_trace.find(selection, fields);
while(cursor.hasNext()) {
    var activity = cursor.next();
    for (var process in activity.content) {
        if (process === undefined || activity.content[process].length === 0) continue;
        var activity_vector = {};
        // [duration, num_events, num_sys_objs, token_index, db_opr_num, cp_opr_num, network_opr_num]
        var vector = [];
        var uniq_objs = [];
        var activity_tokens = [];
        var num_events = activity.content[process].length; // num of events in this activity
        var db_opr_num = 0;
        var cp_opr_num = 0; // content provider
        var network_opr_num = 0; //FIXME related objects are to be defined

        // extra data appended to map node
        activity_vector.name = activity.name; // application owns this activity
        activity_vector.start_date = activity.content[process][0].date; //TODO it is likely that date is not accurate

        for (var index in activity.content[process]) {
            if (index === undefined) continue;
            var object = activity.content[process][index].object;
            if (object === "Database" || object === "db_sample") db_opr_num += 1;
            if (object === "content_query_sample") cp_opr_num += 1;
            if (object === "") network_opr_num += 1; //FIXME determine the object / msg content related to network
            var duration = 0;
            if (num_events > 1) { // duration of this activity
                duration = activity.content[process][num_events - 1].date - activity.content[process][0].date;
            }
            var obj_index = sys_object_index[object];
            if (uniq_objs.indexOf(obj_index) === -1) uniq_objs.push(obj_index);
            var tokens = tokenize(object, activity.content[process][index].msg);
            activity_tokens = _.union(activity_tokens, tokens); // find the union of all tokens in this activity
        }
        var token_hash = hashTokens(JSON.stringify(activity_tokens));
        token_index.push(
            {
                hash: token_hash,
                value: activity_tokens
            }
        );
        // add all features to vector
        var num_sys_objs = uniq_objs.length;
        vector.push(duration);
        vector.push(num_events);
        vector.push(num_sys_objs);
        vector.push(token_hash); // later translate to token_index
        vector.push(db_opr_num);
        vector.push(cp_opr_num);
        vector.push(network_opr_num);
        activity_vector.vector = vector;
        // add activity vector to input vector array
        input_vectors.push(activity_vector);
    } // for loop for processes
} // while loop

// sorting token indices and replace token_hash by the index
// start from the first token group, this can be randomly chosen
sorted_token_hash[0] = token_index[0];
// remove the first element from token_index
token_index.splice(0, 1);
// sort the tokens by similarity (pairwise)
indexTokens();

// translate token hash in IV to sorted token index
input_vectors = convertTokenHash(input_vectors);

// put generated vectors into database
db.activity_vectors.save(input_vectors);

function convertTokenHash(iv) {
    for (var index in iv) {
        if (index === undefined) continue;
        var hash = iv[index].vector[3]; // token_hash is the 4th element in array
        for (var _index in sorted_token_hash) {
            if (_index === undefined) continue;
            if (sorted_token_hash[_index].hash === hash) {
                iv[index].vector[3] = Number(_index);
                break; // break inner loop
            }
        }
    }
    return iv;
}

// in each iteration, finding the closest token group of the last element in the sorted token hash array
// until the sorted_token_hash has same length of token_index list
function indexTokens() {
    for (var j = 0; token_index.length > 0; ++j) {
        var base = sorted_token_hash[j].value;
        var min_distance = 1000000;
        var closet_token;
        var closet_token_index;
        for (var i = 0; i < token_index.length; ++i) {
            var distance = getTokenDistance(base, token_index[i].value);
            if (distance < min_distance) {
                //print("i: " + i);
                closet_token = token_index[i];
                min_distance = distance;
                closet_token_index = i;
            }
        }
        // remove the closet token from the set
        token_index.splice(closet_token_index, 1);
        // store the closet token hash
        sorted_token_hash.push(closet_token);
    }
}

function hashTokens(tokens) { // DJB2 variance hash function
    // generate string hash for the system objects sequence
    var hash, ch;
    for (var i in tokens) {
        if (i === undefined) continue;
        ch = tokens.charCodeAt(i);
        hash = ((hash << 5) - hash) + ch; // hash * 31
        hash &= hash;
    }
    return hash;
}

function getTokenDistance(x, y) {
    var common = _.intersection(x, y);
    var diff = _.difference(x, y);
    if (common.length === 0) return diff.length;
    return diff.length / common.length;
}

//FIXME unused functions
/*
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
*/








