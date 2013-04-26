


function tokenize(object, target) {
    var black_list = ["proc", "Process", "for", ":", "has", ""];
    var tokens = [];

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
        //TODO deal with the case "Starting activity:..."
        if (target.substr(0, 8) === "Starting") return;
        target = target.replace(/\.$/, '');
        var pid = pid_re.exec(target);
        if (pid !== null) {
            pid = pid[0].replace(/\s|:/, '='); //TODO need to verify the match will be one or many
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

}


