
var cursor;
cursor = db.app_related_filesystem_activity.find({app:application_name});

while(cursor.hasNext()) {
    printjson(cursor.next());
}
