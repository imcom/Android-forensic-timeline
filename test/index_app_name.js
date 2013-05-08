



db.app_name_index.drop();
var cursor = db.packages.find();

var index = 0;
var buffer = [];
while(cursor.hasNext()) {
    var record = cursor.next();
    buffer.push({_id: index, name: record.name});
    index += 1;
}

db.app_name_index.insert(buffer);