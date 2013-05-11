


function tokenize(object, target) {
    var black_list = ["proc", "Process", "for", ":", "has", "", "info", "to", "OR", "INTO"];
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
        var read_re = new RegExp(/(?:select)|(?:count)/i);
        var write_re = new RegExp(/(?:insert)|(?:update)|(?:replace)|(?:delete)|(?:create)/i);
        var select_re = new RegExp(/(?:from\s[\s\.,_\?='a-zA-Z0-9]*)$/i);
        var replace_re = new RegExp(/(?:into\s[a-zA-Z0-9_]*)/i);
        var update_re = new RegExp(/(?:update\s[a-zA-Z_\.0-9,]*\sset)/i);
        var create_re = new RegExp(/(?:create[a-zA-Z0-9_\s]*,)/i);

        target = target.substring(1, target.length - 1);
        var tokens_buf = target.split(',');
        var database = tokens_buf[0]; //TODO contains random string
        tokens.push(database);
        var operation;
        var table = "table=unknown";
        if (read_re.exec(target) !== null) {
            operation = "operation=read";
        } else if (write_re.exec(target) !== null) {
            operation = "operation=write";
        } else {
            operation = "operation=unknown";
        }
        tokens.push(operation);
        // try to extract table from create query
        var create = create_re.exec(target);
        if (create !== null) {
            create = create[0].substr(0, create[0].length - 1); // remove last char
            create = create.split(' ');
            table = create[create.length - 1];
            tokens.push(table);
            return tokens;
        }
        // try to extract table from update query
        var update = update_re.exec(target);
        if (update !== null) {
            update = update[0].split(' ');
            // remove syntax text from head and tail of the query
            update.splice(0, 1);
            update.splice(update.length - 1, 1);
            table = "table=" + update.join(' ');
            tokens.push(table);
            return tokens;
        }
        // try to extract table from log on select query
        var select = select_re.exec(target);
        if (select !== null) {
            select = select[0].split(',');
            select.splice(-3, 3); // emit unknown fields
            select = select.join(',');
            table = select.split(' ')[1];
            table = "table=" + table.replace(',', ' ');
            tokens.push(table);
            return tokens;
        }
        // try to extract table from log on replace/insert query
        var replace = replace_re.exec(target);
        if (replace !== null) {
            replace = replace[0];
            tokens_buf = replace.split(' ');
            table = "table=" + tokens_buf[1];
            tokens.push(table);
            return tokens;
        }
        tokens.push(table);
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

    // not in use
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
        var pid_re = new RegExp(/(?:pid=\d+)|(?:pid:\d+)|(?:pid\s-?\d+)/);
        var uid_re = new RegExp(/(?:uid=\d+)/);
        var gid_re = new RegExp(/(?:gids=\{\d+,\s\d+\})/);
        var bracket_re = new RegExp(/\{.*\}|\(.*\)/ig);
        var intent_re = new RegExp(/(?:cmp=[a-zA-Z\._\/]*)/);

        if (target.substr(0, "Starting".length) === "Starting") {
            var pid = pid_re.exec(target)[0];
            pid = pid.replace(' ', '=');
            var intent = intent_re.exec(target)[0];
            tokens.push(pid);
            tokens.push(intent);
            return tokens;
        }

        if (target.substr(0, "startActivity".length) === "startActivity") {
            var context_re = new RegExp(/(?:non-Activity)/);
            var object_re = new RegExp(/(?:forcing\s[a-zA-Z\._]*)/);
            var context = "context=" + context_re.exec(target)[0];
            var object = "object=" + object_re.exec(target)[0].split(' ')[1]; // emit forcing or other verbs
            var intent = intent_re.exec(target)[0];
            tokens.push(context);
            tokens.push(object);
            tokens.push(intent);
            return tokens;
        }

        if (target.substr(0, "Duplicate".length) === "Duplicate") {
            target = target.split(' ');
            var operation = "operation=" + target[1];
            var intent = "intent=" + target[target.length - 1];
            intent = intent.substr(0, intent.length - 1);
            tokens.push(operation);
            tokens.push(intent);
            return tokens;
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

    if (object === "Socket_Alarm") {
        tokens.push(target);
        return tokens;
    }

    if (object === "am_create_service") {
        target = target.substring(1, target.length - 1); // remove heading and tailing []
        var tokens_buf = target.split(',');
        var timestamp = "timestamp=" + tokens_buf[0];
        var service = "service=" + tokens_buf[1];
        var action = "action=none";
        if (tokens_buf[2] !== '') action = "action=" + tokens_buf[2];
        var pid = "pid=" + tokens_buf[3];
        tokens.push(timestamp);
        tokens.push(service);
        tokens.push(action);
        tokens.push(pid);
        return tokens;
    }

    if (object === "am_schedule_service_restart") {
        target = target.substring(1, target.length - 1); // remove heading and tailing []
        var tokens_buf = target.split(',');
        var subject = tokens_buf[0].split('/');
        var app = "app=" + subject[0];
        var service = "service=" + subject[1];
        var interval = "interval=" + tokens_buf[1];
        tokens.push(app);
        tokens.push(service);
        tokens.push(interval);
        return tokens;
    }

    if (object === "am_failed_to_pause") {
        //FIXME unknown fields exist
        target = target.substring(1, target.length - 1); // remove heading and tailing []
        var tokens_buf = target.split(',');
        var timestamp = "timestamp=" + tokens_buf[0];
        var subject = tokens_buf[1].split('/');
        var app = "app=" + subject[0];
        var intent = "intent=" + subject[1];
        tokens.push(timestamp);
        tokens.push(app);
        tokens.push(intent);
        return tokens;
    }

    if (object === "Database") {
        var operation_re = new RegExp(/(?:^db[^\(]+)/);
        var database_re = new RegExp(/(?:path[^,]+)/);
        var operation = operation_re.exec(target)[0];
        var database = database_re.exec(target)[0];
        database = database.replace('\s', '');
        tokens.push(operation);
        tokens.push(database);
        return tokens;
    }

    if (object === "notification_cancel_all") {
        target = target.substring(1, target.length - 1); // remove heading and tailing []
        var tokens_buf = target.split(',');
        var intent = "intent=" + tokens_buf[0];
        tokens.push(intent);
        return tokens;
    }

    if (object === "WindowManager") {
        var content_re = new RegExp(/\{.*\}/);
        var event_re = new RegExp(/[^:]+/);
        var event = event_re.exec(target)[0];
        var content = content_re.exec(target)[0].split('\s'); //FIXME unknown fields exist
        var app = content[1].split('/')[0];
        var intent = content[1].split('/')[1];
        tokens.push(app);
        tokens.push(intent);
        tokens.push(event);
        return tokens;
    }

    // debugging info
    var _console = this.console;
    if (_console !== undefined) {
        _console.log(object);
        _console.log(target);
    } else {
        print(object);
        print(target);
    }
    return ["undefined"];
}


