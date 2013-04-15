
var cursor;
cursor = db.ServiceInfo.find({name: application_name}, {_id: 0});

while(cursor.hasNext()) {
    printjson(cursor.next());
}
