
var selection = {content: {$ne: null}};
var fields = {_id: 0};
var cursor = db.application_trace.find(selection, fields);

var result = [];
while(cursor.hasNext()) {
    var record = cursor.next();
    result.push(record);
}

printjson(result);



