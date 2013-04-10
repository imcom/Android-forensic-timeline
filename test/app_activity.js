
var cursor;
var model;
var selection;
var all_apps_name = [];
var all_apps_uid = [];
var system_objects = {};
var file_system_activity = {};
var projection = {_id: 0, level: 0};

cursor = db.packages.find();

while(cursor.hasNext()) {
    var record = cursor.next();
    all_apps_name.push(record.name);
    all_apps_uid.push(record.uid);
}

for (var i = 0; i < all_apps_uid.length; ++i) {
    var target = all_apps_name[i];
    file_system_activity[target] = {};
    selection = {uid: all_apps_uid[i]};

    cursor = db.fs_time.find(selection, {_id:0});
    while(cursor.hasNext()) {
        var record = cursor.next();
        var content = {};
        file_system_activity[target].id = record.uid;
        if (file_system_activity[target].hasOwnProperty(record.date) == false) {
            file_system_activity[target][record.date] = [];
        }
        content.name = record.file;
        content.file_activity = record.activity;
        content.inode_activity = {inode: record.inode};

        cursor = db.inode_time.find({inode:record.inode}, {_id:0});
        if (cursor.hasNext()) {
            var inode_record = cursor.next();
            content.inode_activity.uid = inode_record.uid;
            content.inode_activity.gid = inode_record.gid;
            content.inode_activity.access = inode_record.accessed;
            content.inode_activity.change = inode_record.inode_modified;
            content.inode_activity.modifiy = inode_record.file_modified;
        }
        file_system_activity[target][record.date].push(content);
    }
}


for (var i = 0; i < all_apps_name.length; ++i) {
    var target = all_apps_name[i];
    system_objects[target] = {};
    selection = {msg: new RegExp('.*(' + target + "|" + target.substr(target.indexOf(".") + 1) + ").*", 'i')};

    cursor = db.events.find(selection, projection);
    while(cursor.hasNext()) {
        var record = cursor.next();
        if (system_objects[target].hasOwnProperty(record.object) == false) {
            system_objects[target][record.object] = {};
            system_objects[target][record.object][record.pid] = [record.msg];
        } else {
            if (system_objects[target][record.object].hasOwnProperty(record.pid) == false)
                system_objects[target][record.object][record.pid] = [record.msg];
            else
                system_objects[target][record.object][record.pid].push(record.msg);
        }
    }

    cursor = db.main.find(selection, projection);
    while(cursor.hasNext()) {
        var record = cursor.next();
        if (system_objects[target].hasOwnProperty(record.object) == false) {
            system_objects[target][record.object] = {};
            system_objects[target][record.object][record.pid] = [record.msg];
        } else {
            if (system_objects[target][record.object].hasOwnProperty(record.pid) == false)
                system_objects[target][record.object][record.pid] = [record.msg];
            else
                system_objects[target][record.object][record.pid].push(record.msg);
        }
    }

    cursor = db.system.find(selection, projection);
    while(cursor.hasNext()) {
        var record = cursor.next();
        if (system_objects[target].hasOwnProperty(record.object) == false) {
            system_objects[target][record.object] = {};
            system_objects[target][record.object][record.pid] = [record.msg];
        } else {
            if (system_objects[target][record.object].hasOwnProperty(record.pid) == false)
                system_objects[target][record.object][record.pid] = [record.msg];
            else
                system_objects[target][record.object][record.pid].push(record.msg);
        }
    }
}

var save_buf = [];
var _id = 0;
for (var object in system_objects) {
    if (system_objects.hasOwnProperty(object)) {
        var buf = {};
        buf._id = _id;
        buf.app = object;
        buf.detail = system_objects[object];
        _id += 1;
        save_buf.push(buf);
    }
}
db.app_related_system_calls.insert(save_buf);

save_buf = [];
_id = 0;
for (var object in file_system_activity) {
    if (file_system_activity.hasOwnProperty(object)) {
        var buf = {};
        buf._id = _id;
        buf.app = object;
        buf.detail = file_system_activity[object];
        _id += 1;
        save_buf.push(buf);
    }
}
db.app_related_filesystem_activity.insert(save_buf);

print("Created `app_related_system_calls` and `app_related_filesystem_activity`");


