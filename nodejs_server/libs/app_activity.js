
/*
 *  Script run before the server starts
 *  Init collections of application related activities
 */

var cursor;
var model;
var selection;
var all_apps_name = [];
var all_apps_uid = [];
var system_objects = {};
var file_system_activity = {};
var projection = {_id: 0, level: 0};

cursor = db.packages.find();

// get all detected applications
while(cursor.hasNext()) {
    var record = cursor.next();
    all_apps_name.push(record.name);
    all_apps_uid.push(record.uid);
}

// for each application, fetch file system activities
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
            content.inode_activity.modify = inode_record.file_modified;
        }
        file_system_activity[target][record.date].push(content);
    }
}

// for each application, fetch system calls/activities contain application's keywords
for (var i = 0; i < all_apps_name.length; ++i) {
    var target = all_apps_name[i];
    system_objects[target] = {};
    selection = {msg: new RegExp('.*(' + target + "|" + target.substr(target.indexOf(".") + 1) + ").*", 'i')};

    cursor = db.events.find(selection, projection);
    while(cursor.hasNext()) {
        var record = cursor.next();
        var content = {};
        content.date = record.date;
        content.msg = record.msg;
        if (system_objects[target].hasOwnProperty(record.object) == false) {
            system_objects[target][record.object] = {};
            system_objects[target][record.object][record.pid] = [content];
        } else {
            if (system_objects[target][record.object].hasOwnProperty(record.pid) == false)
                system_objects[target][record.object][record.pid] = [content];
            else
                system_objects[target][record.object][record.pid].push(content);
        }
    }

    cursor = db.main.find(selection, projection);
    while(cursor.hasNext()) {
        var record = cursor.next();
        var content = {};
        content.date = record.date;
        content.msg = record.msg;
        if (system_objects[target].hasOwnProperty(record.object) == false) {
            system_objects[target][record.object] = {};
            system_objects[target][record.object][record.pid] = [content];
        } else {
            if (system_objects[target][record.object].hasOwnProperty(record.pid) == false)
                system_objects[target][record.object][record.pid] = [content];
            else
                system_objects[target][record.object][record.pid].push(content);
        }
    }

    cursor = db.system.find(selection, projection);
    while(cursor.hasNext()) {
        var record = cursor.next();
        var content = {};
        content.date = record.date;
        content.msg = record.msg;
        if (system_objects[target].hasOwnProperty(record.object) == false) {
            system_objects[target][record.object] = {};
            system_objects[target][record.object][record.pid] = [content];
        } else {
            if (system_objects[target][record.object].hasOwnProperty(record.pid) == false)
                system_objects[target][record.object][record.pid] = [content];
            else
                system_objects[target][record.object][record.pid].push(content);
        }
    }
}

// write system calls records to DB
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

// write file system activities to DB
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

print("created collections `app_related_system_calls` and `app_related_filesystem_activity`");
print("starting server now...");


