
var cursor;
cursor = db.app_related_filesystem_activity.find({app:application_name});
var result = [];
while(cursor.hasNext()) {
    result.push(cursor.next());
}

if (result.length > 0)
    printjson(result);