


function tokenize(object, target) {
    var black_list = ["proc", "Process", "for", ":", "has", "", "info", "to"];
    var tokens = [];

    // tokenize am_destroy_service
    if (object === "am_destroy_service") {
        target = target.substring(1, target.length - 1);
        var tokens_buf = target.split(',');
        var timestamp = "timestamp=" + tokens_buf[0];
        var service = "service=" + tokens_buf[1];
        var pid = "pid=" + tokens_buf[2];
        tokens.push(timestamp);
        tokens.push(service);
        tokens.push(pid);
        return tokens;
    }

    // tokenize ActivityThread
    if (object === "ActivityThread") {
        var tokens_buf = target.split(' ');
        tokens_buf.forEach(function(token) {
            if (black_list.indexOf(token) === -1)
                tokens.push(token);
        });
        return tokens;
    }

    // tokenize NotificationService
    if (object === "NotificationService") {
        var tokens_buf = target.split(',');
        var action = "action=" + tokens_buf[0];
        var description = "description=" + tokens_buf[1].trim();
        var pkg = tokens_buf[2].trim();
        var id = tokens_buf[3].trim();
        tokens.push(action);
        tokens.push(description);
        tokens.push(pkg);
        tokens.push(id);
        return tokens;
    }

    // tokenize db_sample
    if (object === "db_sample") {
        //TODO emitted where clause and other unknown fields
        var select_re = new RegExp(/(?:select\s[a-zA-Z0-9,_\*]*)\s/);
        var from_re = new RegExp(/(?:from\s[a-zA-Z0-9,_\*]*)\s/);
        target = target.substring(1, target.length - 1);
        var tokens_buf = target.split(',');
        var database = tokens_buf[0]; //TODO contains random string
        var select = select_re.exec(target)[0].trim();
        select = select.replace(' ', '='); // replace the ` ` after select to `=`
        select = select.replace(/,/g, ' '); // replace or `,` to ` `
        var from = from_re.exec(target)[0].trim();
        from = from.replace(' ', '='); // replace the ` ` after from to `=`
        from = from.replace(/,/g, ' '); // replace or `,` to ` `
        tokens.push(database);
        tokens.push(select);
        tokens.push(from);
        return tokens;
    }

    // tokenize notification_enqueue
    if (object === "notification_enqueue") {
        //TODO more fields exist, but do not know what are they
        target = target.substring(1, target.length - 1);
        var tokens_buf = target.split(',');
        var app = tokens_buf[0];
        var type = tokens_buf[2];
        tokens.push(app);
        tokens.push(type);
        return tokens;
    }

    //FIXME to be removed
    if (object === "sqlite_mem_released") return ["sqlite_mem_released"];

    // tokenize am_finish_activity
    if (object === "am_finish_activity") {
        //TODO more fields exist, but do not know what are they
        target = target.substring(1, target.length - 1);
        var tokens_buf = target.split(',');
        var timestamp = "timestamp=" + tokens_buf[0];
        var intent = tokens_buf[2];
        var origin = "origin=" + tokens_buf[3];
        tokens.push(timestamp);
        tokens.push(intent);
        tokens.push(origin);
        return tokens;
    }

    // tokenize activity_launch_time
    if (object === "activity_launch_time") {
        //TODO more fields exist, but do not know what are they
        target = target.substring(1, target.length - 1);
        var tokens_buf = target.split(',');
        var timestamp = "timestamp=" + tokens_buf[0];
        var intent = tokens_buf[1];
        tokens.push(timestamp);
        tokens.push(intent);
        return tokens;
    }

    // tokenize am_pause_activity
    if (object === "am_pause_activity") {
        target = target.substring(1, target.length - 1);
        var tokens_buf = target.split(',');
        var timestamp = "timestamp=" + tokens_buf[0];
        var intent = tokens_buf[1];
        tokens.push(timestamp);
        tokens.push(intent);
        return tokens;
    }

    // tokenize notification_cancel
    if (object === "notification_cancel") {
        //TODO more fields exist, but do not know what are they
        target = target.substring(1, target.length - 1);
        var tokens_buf = target.split(',');
        var app = tokens_buf[0];
        tokens.push(app);
        return tokens;
    }

    // tokenize am_create_activity & am_new_intent
    if (object === "am_create_activity" || object === "am_new_intent") {
        target = target.substring(1, target.length - 1);
        var tokens_buf = target.split(',');
        var timestamp = "timestamp=" + tokens_buf[0];
        var intent = tokens_buf[2];
        //TODO more fields exist, but do not know what are they
        tokens.push(timestamp);
        tokens.push(intent);
        return tokens;
    }

    // tokenize binder_sample
    if (object === "binder_sample") {
        target = target.substring(1, target.length - 1);
        var tokens_buf = target.split(',');
        var intent = tokens_buf[0];
        var app = tokens_buf[3];
        tokens.push(intent);
        tokens.push(app);
        return tokens;
    }

    // tokenize am_on_resume_called & am_on_paused_called
    if (object === "am_on_resume_called" || object === "am_on_paused_called") {
        tokens.push(target);
        return tokens;
    }

    // tokenzie am_resume_activity & am_restart_activity & am_destroy_activity
    if (object === "am_resume_activity" ||
        object === "am_restart_activity" ||
        object === "am_destroy_activity")
    {
        //TODO more fields exist, but do not know what are they
        target = target.substring(1, target.length - 1);
        var tokens_buf = target.split(',');
        var timestamp = "timestamp=" + tokens_buf[0];
        var intent = tokens_buf[2];
        tokens.push(timestamp);
        tokens.push(intent);
        return tokens;
    }

    // tokenize am_proc_start
    if (object === "am_proc_start") {
        target = target.substring(1, target.length - 1);
        var tokens_buf = target.split(',');
        var pid = "pid=" + tokens_buf[0];
        var uid = "uid=" + tokens_buf[1];
        var app = tokens_buf[2];
        var type = tokens_buf[3];
        var intent = tokens_buf[4];
        tokens.push(pid);
        tokens.push(uid);
        tokens.push(app);
        tokens.push(type);
        tokens.push(intent);
        return tokens;
    }

    // tokenize am_proc_dies, am_proc_bound
    if (object === "am_proc_died" || object === "am_proc_bound") {
        target = target.substring(1, target.length - 1);
        var tokens_buf = target.split(',');
        var pid = "pid=" + tokens_buf[0];
        var app = tokens_buf[1];
        tokens.push(pid);
        tokens.push(app);
        return tokens;
    }

    // tokenize activity manager
    if (object === "ActivityManager") {
        var pid_re = new RegExp(/(?:pid=\d+)|(?:pid:\d+)|(?:pid\s\d+)/);
        var uid_re = new RegExp(/(?:uid=\d+)/);
        var gid_re = new RegExp(/(?:gids=\{\d+,\s\d+\})/);
        var bracket_re = new RegExp(/\{.*\}|\(.*\)/ig);

        if (target.substr(0, "Starting".length) === "Starting") {
            console.log(target);
            return [];
        }

        if (target.substr(0, "startActivity".length) === "startActivity") {
            console.log(target);
            return [];
        }

        if (target.substr(0, "Duplicate".length) === "Duplicate") {
            console.log(target);
            return [];
        }

        target = target.replace(/\.$/, '');
        var pid = pid_re.exec(target);
        if (pid !== null) {
            //TODO need to verify the match will be one or many
            pid = pid[0].replace(/\s|:/, '=');
            tokens.push(pid);
        }
        var gid = gid_re.exec(target);
        if (gid !== null) {
            gid = gid[0].replace(/\{|\}|,/g, '');
            tokens.push(gid);
        }
        var uid = uid_re.exec(target);
        if (uid !== null) {
            tokens.push(uid[0]);
        }
        var msg = target.replace(bracket_re, '');
        msg = msg.replace(/pid.*\d\s/, '');
        msg = msg.replace(/uid.*\d\s/, '');
        msg = msg.replace(/gids=.*/, '');
        msg = msg.replace(/:/, ' ');
        msg.split(' ').forEach(function(token) {
            if (black_list.indexOf(token) === -1)
                tokens.push(token);
        });
        return tokens;
    }

    // tokenize content_query_sample
    if (object === "content_query_sample") {
        var numeric_re = new RegExp(/^\d+$/);
        var like_re = new RegExp(/.*like.*/i);
        target = target.substring(1, target.length - 1); // remove heading and tailing []
        var query = target.split(',');
        var query_target = "target=" + query[0];
        if (query_target.indexOf('?') !== -1) {
            var query_statements = query_target.split('?')[1];
            query_target = query_target.split('?')[0];
        }
        if (query[1] === '') query[1] = "null";
        var query_fields = "fields=" + query[1].replace(/\//g, ' ');
        query.splice(0, 2); // remove target and fields from query array
        var query_selection = "selection=";
        query.forEach(function(selection) { // remove implicit query selections
            if (selection !== "" && !numeric_re.test(selection)) {
                if (selection.indexOf('=') !== -1) {
                    query_selection += selection.replace(/\s/, '');
                }
                if (like_re.test(selection))
                    selection = selection.replace(/\s/g, '');
                    selection = selection.replace(/like/i, '~=') // like converts to ~=
                    query_selection += selection;
                query_selection += ' ';
            }
        });
        if (query_statements !== undefined) {
            query_statements.split('&').forEach(function(statement) {
                query_selection += statement;
                query_selection += ' ';
            });
        }
        if (query_selection === 'selection=') query_selection += "null";
        tokens.push(query_target);
        tokens.push(query_fields);
        tokens.push(query_selection.replace(/\s*$/, ''));
        return tokens;
    }

    // debugging info
    console.log(object);
    console.log(target);
}


