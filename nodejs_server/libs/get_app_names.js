

var cursor = db.packages.find();

while(cursor.hasNext()) {
    var record = cursor.next();
    print(record.name);
}
