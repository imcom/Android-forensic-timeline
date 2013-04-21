

// clear old data
db.app_related_system_calls.drop();
db.app_related_filesystem_activity.drop();


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
    var detected_ids = [];

    cursor = db.events.find(selection, projection);
    while(cursor.hasNext()) {
        var record = cursor.next();
        var content = {};
        content.date = record.date;
        content.msg = record.msg;
        if (record.object === "am_proc_start" || record.object === "am_proc_died") {
            var pid = record.msg.substr(1, record.msg.length - 1).split(',', 1)[0];
            if (detected_ids.indexOf(pid) === -1) {
                detected_ids.push(pid);
            }
        }
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
    var refined_selection = {};
    refined_selection['object'] = {$not: new RegExp('.*_?gc_?.*', 'i')};
    refined_selection['pid'] = {$in: detected_ids};
    refined_selection['msg'] = {$not: selection.msg};

    cursor = db.events.find(refined_selection, projection);
    while(cursor.hasNext()) {
        var record = cursor.next();
        var content = {};
        content.date = record.date;
        content.msg = record.msg;
        if (system_objects[target].hasOwnProperty(record.object) == false) {
            system_objects[target][record.object] = {};
            system_objects[target][record.object][record.pid] = [content];
        } else {
            if (system_objects[target][record.object].hasOwnProperty(record.pid) == false) {
                system_objects[target][record.object][record.pid] = [content];
            } else {
                system_objects[target][record.object][record.pid].push(content);
            }
        }
    }

    refined_selection = {};
    refined_selection['$or'] = [];
    refined_selection['$or'].push(selection); // msg reg selection as one statement in OR query
    var pid_selection = {};
    pid_selection['pid'] = {};
    pid_selection['pid']['$in'] = detected_ids;
    refined_selection['$or'].push(pid_selection); // array of related pids for query
    refined_selection['object'] = {$not: new RegExp('.*_?gc_?.*', 'i')};

    cursor = db.main.find(refined_selection, projection);
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

    cursor = db.system.find(refined_selection, projection);
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



