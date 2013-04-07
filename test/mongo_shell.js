

var selection = {};
selection.date = {$gte:1365366000, $lte:1365366200};
selection.msg = {$not: new RegExp('.*gc.*', 'i')}
selection.object = {$not: new RegExp('.*(gc|SurfaceFlinger).*', 'i')}

var projection = {_id:0, level:0};
var cursor;

cursor = db.main.find(selection, projection);
print("Main:");
while(cursor.hasNext()) {
    var record = cursor.next();
    printjson(record);
}

print("System:");
cursor = db.system.find(selection, projection);
while(cursor.hasNext()) {
    var record = cursor.next();
    printjson(record);
}

print("Events:");
cursor = db.events.find(selection, projection);
while(cursor.hasNext()) {
    var record = cursor.next();
    printjson(record);
}

print("Dmesg:");
var dmesg_selection = {date: selection.date}
dmesg_selection.event = {$not: new RegExp('.*(call alarm|BATT).*', 'i')}
cursor = db.dmesg.find(dmesg_selection, {_id:0});
while(cursor.hasNext()) {
    var record = cursor.next();
    printjson(record);
}
