

var selection = {};
var fields = {_id: 0};
selection['name'] = application_name;
var cursor = db.application_trace.find(selection, fields);

if(cursor.hasNext()) {
    printjson(cursor.next());
}

