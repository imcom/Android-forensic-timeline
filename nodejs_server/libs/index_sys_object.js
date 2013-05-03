
db.system_object_index.drop()
var cursor = db.app_name_index.find();
var system_objects = [];

var app_names = [];
while(cursor.hasNext()) {
    app_names.push(cursor.next().name);
}

app_names.forEach(function(app_name) {
    cursor = db.app_related_system_calls.find({app:app_name});
    if (cursor.hasNext()) {
        for (var obj in cursor.next().detail) {
            if (obj === undefined) continue;
            if (system_objects.indexOf(obj) === -1) {
                system_objects.push(obj);
            }
        }
    }
});

var buffer = [];
for (var index in system_objects) {
    if (index === undefined) continue;
    buffer.push({_id: index, name: system_objects[index]});
}

db.system_object_index.insert(buffer);

