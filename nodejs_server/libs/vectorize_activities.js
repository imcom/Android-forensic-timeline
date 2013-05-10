
// clear old collection first
db.activity_vectors.drop()
db.token_hash.drop()

var cursor;
/*var app_name_index = {};
cursor = db.app_name_index.find();
while (cursor.hasNext()) {
    var record = cursor.next();
    app_name_index[record.name] = record._id;
}*/

/*var sys_object_index = {};
cursor = db.system_object_index.find();
while (cursor.hasNext()) {
    var record = cursor.next();
    sys_object_index[record.name] = record._id;
}*/

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
        activity_vector.name = activity.name; // application owns this activity
        activity_vector.start_date = activity.content[process][0].date; //TODO it is likely that date is not accurate
        var result = vectorize(activity.content[process]);
        activity_vector.vector = result.vector;
        // add token index to index array
        token_index.push(result.token_index);
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

// save token hash index to database
for (var index in sorted_token_hash) {
    if (index === undefined) continue;
    var hash_record = {};
    hash_record._id = index;
    hash_record.hash = sorted_token_hash[index].hash;
    hash_record.value = sorted_token_hash[index].value;
    db.token_hash.insert(hash_record);
}

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
        var closest_token;
        var closest_token_index;
        for (var i = 0; i < token_index.length; ++i) {
            var distance = getTokenDistance(base, token_index[i].value);
            if (distance < min_distance) {
                closest_token = token_index[i];
                min_distance = distance;
                closest_token_index = i;
            }
        }
        // remove the closet token from the set
        token_index.splice(closest_token_index, 1);
        // store the closet token hash
        sorted_token_hash.push(closest_token);
    }
}

function getTokenDistance(x, y) {
    var common = _.intersection(x, y);
    var diff = _.difference(x, y);
    if (common.length === 0) return diff.length;
    return diff.length / common.length;
}









