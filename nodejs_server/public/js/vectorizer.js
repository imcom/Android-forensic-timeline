
// init system object index
/*var sys_object_index = {};
var cursor = db.system_object_index.find();
while (cursor.hasNext()) {
    var record = cursor.next();
    sys_object_index[record.name] = record._id;
}*/

function vectorize(target) {

    // [duration, num_events, num_sys_objs, token_index, db_opr_num, cp_opr_num, network_opr_num]
    var vector = [];
    var uniq_objs = [];
    var activity_tokens = [];
    var token_index; // {`hash`: token_hash, `value`: tokens}
    //var num_events = activity.content[process].length; // num of events in this activity
    var num_events = target.length; // num of events in this activity
    var db_opr_num = 0;
    var cp_opr_num = 0; // content provider
    var network_opr_num = 0; //FIXME related objects are to be defined

    for (var index in target) {
        if (index === undefined) continue;
        var object = target[index].object;
        if (object === "Database" || object === "db_sample") db_opr_num += 1;
        if (object === "content_query_sample") cp_opr_num += 1;
        if (object === "") network_opr_num += 1; //FIXME determine the object / msg content related to network
        var duration = 0;
        if (num_events > 1) { // duration of this activity
            duration = target[num_events - 1].date - target[0].date;
        }
        //var obj_index = sys_object_index[object];
        //if (uniq_objs.indexOf(obj_index) === -1) uniq_objs.push(obj_index);
        if (uniq_objs.indexOf(object) === -1) uniq_objs.push(object);
        var tokens = tokenize(object, target[index].msg);
        activity_tokens = _.union(activity_tokens, tokens); // find the union of all tokens in this activity
    }
    var token_hash = hashTokens(JSON.stringify(activity_tokens));
    token_index = {
        hash: token_hash,
        value: activity_tokens
    }
    // add all features to vector
    var num_sys_objs = uniq_objs.length;
    vector.push(duration);
    vector.push(num_events);
    vector.push(num_sys_objs);
    vector.push(token_hash); // later translate to token_index
    vector.push(db_opr_num);
    vector.push(cp_opr_num);
    vector.push(network_opr_num);

    var result = {};
    result.vector = vector;
    result.token_index = token_index;

    return result;

}

function hashTokens(tokens) { // DJB2 variance hash function
    // generate string hash for activity tokens
    var hash, ch;
    for (var i in tokens) {
        if (i === undefined) continue;
        ch = tokens.charCodeAt(i);
        hash = ((hash << 5) - hash) + ch; // hash * 31
        hash &= hash;
    }
    return hash;
}






