
/*Disable global name $ from jQuery and reload it into Zepto*/
jQuery.noConflict();
$ = Zepto;

// query or display area
var responsive_app_pane = $('#responsive-apps');
var aggregation_options = $('#map-reduce-type');
var aggregation_arena = $('#aggregation-arena');
var responsive_pid_pane = $('#responsive-pids');
var responsive_object_pane = $('#responsive-objects');
var dmesg_selection = $('#dmesg-selection-input');
//var collection = $('#collection-input');
//var selection = $('#selection-input');
//var file_activity_selection = $('#file-activity-selection-input');
//var relevance_selection = $('#relevance-selection-input');
//var app_trace_selection = $('#app-trace-selection-input');

/*window.onscroll = function(event) {
    if (window.scrollY >= window.innerHeight) {
        $('.back-to-top').css('opacity', 0.8).css('z-index', 100);
    } else {
        $('.back-to-top').css('opacity', 0).css('z-index', -1);
    }
};*/

// control buttons
var file_activity_search_btn = $('#file-activity-search');
var dropdown_btn = $('.dropdown-ctrl-bar');
var popup_btn = $('.popup-ctrl-bar');
var slide_right_btn = $('.slide-right-ctrl-bar');
var slide_left_btn = $('.slide-left-ctrl-bar');
var aggregate_btn = $('#aggregate-btn');
var dmesg_search_btn = $('#dmesg-search');
//var relevance_search_btn = $('#relevance-search');
//var app_trace_search_btn = $('#app-trace-search');
//var expand_btn = $('#expand');
//var filter_btn = $('#filter');
//var clear_btn = $('#clear');
//var search_btn = $('#search');

// global variables
var dataset = [];
var path_dataset = {};
var dropdown_pane_collapsed = 1;
var popup_pane_collapsed = 1;
var slide_right_pane_collapsed = 1;
var slide_left_pane_collapsed = 1;
var object_selected = false;
var pid_selected = false;
var selected_object;
var selected_pid;
//var time_range = [];

// timeline SVG
var timeline_main = new Timeline("#timeline_main");

// not in use currently
/*
function traceApplication() {
    var app_name;
    if (app_trace_selection.val() !== '') {
        app_name = app_trace_selection.val();
    } else {
        showAlert("No application specified");
        return;
    }

    $.ajax({
        type: "POST",
        url: "application_trace",
        data: {
            selection: app_name,
            type: "exec"
        },
        dataType: 'json',
        success: function(data) {
            if (data.content !== "") {
                var path_groups = [];
                dataset_extend = [];
                var path_index = 0;
                var application_trace = JSON.parse(data.content);
                //console.log(application_trace);
                // call a function to generate delta timeline dataset
                generateDeltaTimeGraph(application_trace);
                // prepare dataset for application trace graph
                for (var process in application_trace) {
                    path_group = [];
                    if (application_trace.hasOwnProperty(process)) { // pid or unknown
                        application_trace[process].forEach(function(record) {
                            record.level = process;
                            dataset_extend.push(record);
                            path_group.push(
                                {
                                    process: process,
                                    _id: record.pid,
                                    date: new Date(record.date * 1000) // convert to date
                                }
                            );
                        });
                        //path_groups[path_index] = path_group;
                        if (application_trace[process].length > 0)
                            path_groups.push(process);
                        //path_index += 1;
                    }
                }
                var generic_data = new GenericData(data.type, dataset_extend);
                dataset_extend = generic_data.unifyDataset();
                $('#timeline_extend').children().remove();
                timeline_extend.clearData(true, true);
                timeline_extend.initTimeline();
                var check_suspects = false;
                var path_dataset = {};
                path_dataset.name = app_name;
                path_dataset.content = path_groups;
                fillExtendResponsivePane(path_groups);
                timeline_extend.setDataset(dataset_extend, path_dataset, check_suspects, false);
                $('#progress-bar').animate({"bottom": 0}, 100, "ease", showProgressBar);
                //$('#zoom-out').css('opacity', 0.8).css('z-index', 50);
            } else {
                showAlert("no records found!");
            }
        },
        error: function(xhr, type) {
            showAlert("trace query error!");
        }
    });
}

function updateResponsivePane(target_checkboxes, display_dataset, key) {
    var selected = [];
    display_dataset.forEach(function(record) {
        selected.push(record[key]);
    });
    target_checkboxes.forEach(function(checkbox) {
        if ($.inArray(checkbox.value, selected) == -1) {
            checkbox.checked = false;
        } else {
            if (!checkbox.checked) {
                checkbox.checked = true;
            }
        }
    });
}

function onIdSelection() {
    if (current_dataset.length === 0) current_dataset = dataset;
    var id_checkboxs = $('input[id="id-checkbox"]');
    var object_checkboxs = $('input[id="object-checkbox"]');
    var display_dataset;
    var display_ids = [];
    id_checkboxs.forEach(function(checkbox) {
        if (checkbox.checked) {
            display_ids.push(checkbox.value);
        }
    });
    display_dataset = current_dataset.filter(function(record) {
        return $.inArray(record._id, display_ids) != -1;
    });
    clearPanes(false, false, false, true);
    fillPanes(display_dataset);
    resetTimeRange();
    initTimeRange(display_dataset);
    updateResponsivePane(object_checkboxs, display_dataset, "object");
    timeline_main.clearData(true, false);
    timeline_main.initTimeline();
    timeline_main.setDataset(display_dataset, null, false, true);
}

function onObjectSelection() {
    if (current_dataset.length === 0) current_dataset = dataset;
    var object_checkboxs = $('input[id="object-checkbox"]');
    var id_checkboxs = $('input[id="id-checkbox"]');
    var display_dataset;
    var display_objects = [];
    object_checkboxs.forEach(function(checkbox) {
        if (checkbox.checked) {
            display_objects.push(checkbox.value);
        }
    });
    display_dataset = current_dataset.filter(function(record) {
        return $.inArray(record.object, display_objects) != -1;
    });
    clearPanes(false, false, false, true);
    fillPanes(display_dataset);
    resetTimeRange();
    initTimeRange(display_dataset);
    updateResponsivePane(id_checkboxs, display_dataset, "_id");
    timeline_main.clearData(true, false);
    timeline_main.initTimeline();
    timeline_main.setDataset(display_dataset, null, false, true);
}

function fillResponsivePane(target_set) {
    var ids = [];
    var objects = [];
    target_set.forEach(function(record) {
        if ($.inArray(record._id, ids) == -1) {
            responsive_id_pane.append(
                "<label type='checkbox inline'><input class='main-checkbox' id='id-checkbox' type='checkbox' onChange='onIdSelection()' value='" + record._id + "'>" + record._id + "</label>"
            );
            ids.push(record._id);
        }
        if ($.inArray(record.object, objects) == -1) {
            responsive_object_pane.append(
                "<label type='checkbox inline'><input class='main-checkbox' id='object-checkbox' type='checkbox' onChange='onObjectSelection()' value='" + record.object + "'>" + record.object + "</label>"
            );
            objects.push(record.object);
        }
    });
    var checkboxes = $('.main-checkbox');
    checkboxes.forEach(function(box){
        box.checked = true;
    });
}

function clearPanes(clear_responsive, clear_aggregation, clear_extend_timeline, clear_time_window) {
    object_pane.children().remove();
    id_pane.children().remove();
    selection.val("");
    var window_start = $('#time-window-start');
    var window_end = $('#time-window-end');
    if (clear_time_window) {
        window_start.children().remove();
        window_end.children().remove();
    }
    $('#timeline_main').children().remove();
    if (clear_extend_timeline) {
        $('#timeline_extend').children().remove();
    }
    if (clear_responsive) {
        responsive_id_pane.children().remove();
        responsive_object_pane.children().remove();
        responsive_id_pane_extend.children().remove();
    }
    if (clear_aggregation) {
        aggregation_options.children().remove();
        aggregation_options.append("<option>aggregate by ...</option>");
    }
}

function fillPanes(src) {
    var objects = [];
    var ids = [];
    src.forEach(function(record) {
        if ($.inArray(record.object, objects) == -1) {
            object_pane.append("<option>" + record.object + "</option>");
            objects.push(record.object);
        }
        if ($.inArray(record._id, ids) == -1) {
            id_pane.append("<option>" + record._id + "</option>");
            ids.push(record._id);
        }
    });
    $("#objects option").click(function() {
        id_pane.val(null);
        id_selected = false;
        if (object_selected) {
            if (selected_object != $(this).val()) {
                object_pane.val($(this).val());
                selected_object = object_pane.val();
            } else {
                object_pane.val(null);
                object_selected = false;
                selected_object = null;
            }
        } else {
            object_selected = true;
            selected_object = object_pane.val();
        }
    });
    $("#ids option").click(function() {
        object_pane.val(null);
        object_selected = false;
        if (id_selected) {
            if (selected_id != $(this).val()) {
                id_pane.val($(this).val());
                selected_id = id_pane.val();
            } else {
                id_pane.val(null);
                id_selected = false;
                selected_id = null;
            }
        } else {
            id_selected = true;
            selected_id = id_pane.val();
        }
    });
}

function formSelection() {
    if (selection.val() != '') { // always use OR logic in query
        var regex_selection = {};
        regex_selection['$or'] = [];
        var keywords = selection.val().split(' ');
        regex_selection['$or'].push({object : keywords.join('|')});
        regex_selection['$or'].push({msg : keywords.join('|')});
        regex_selection['object'] = ".*_?gc_?.*";
    } else {
        var regex_selection = {object: ".*_?gc_?.*"};
    }
    return JSON.stringify(regex_selection);
}

function fillMapReduceOptions(data_type) {
    if (data_type === 'android_logs') {
        aggregation_options.children().remove();
        aggregation_options.append("<option value='object'>aggregate by Object</option>");
        aggregation_options.append("<option value='id'>aggregate by ID</option>");
    }
}

function drawMainTimeline(on_startup) {
    var main_selection = formSelection();
    if (!on_startup) {
        var target = collection.val().split(':'); // target = [url(type), collection]
    } else {
        target = ['android_logs', 'events']; // on startup default to events log
    }
    $.ajax({
        type: "POST",
        url: target[0],
        data: {
            collection: target[1],
            selection: main_selection,
            type: "query"
        },
        dataType: 'json',
        success: function(data) {
            if (data.content.length > 0) {
                var generic_data = new GenericData(data.type, data.content);
                dataset = generic_data.unifyDataset();
                clearPanes(true, true, true, true);
                fillPanes(dataset);
                fillResponsivePane(dataset);
                initTimeRange(dataset);
                fillMapReduceOptions(data.type);
                timeline_main.initTimeline();
                var check_suspects = false;
                if (data.type === 'android_logs') check_suspects = true;
                timeline_main.setDataset(dataset, null, check_suspects, true);
                $('#progress-bar').animate({"bottom": 0}, 100, "ease", showProgressBar);
            } else {
                showAlert("no records found!");
            }
        },
        error: function(xhr, type) {
            showAlert("search query error!");
        }
    });
}
*/

function onAppSelection() {
    var app_checkboxs = $('.app-checkbox');
    var display_dataset;
    var display_apps = [];
    var display_path_set = {};
    app_checkboxs.forEach(function(checkbox) {
        if (checkbox.checked) {
            // save the selected apps for drawing path
            display_path_set[checkbox.value] = path_dataset[checkbox.value];
            display_apps.push(checkbox.value);
        }
    });
    display_dataset = dataset.filter(function(record) {
        return $.inArray(record._id, display_apps) !== -1;
    });
    timeline_main.removeTimeline();
    timeline_main.clearData();
    timeline_main.initTimeline();
    timeline_main.setDataset(display_dataset, display_path_set);
}

function fillAppResponsivePane(path_groups) {
    for (var app in path_groups) {
        if (app === undefined) continue;
        responsive_app_pane.append (
            "<label type='checkbox inline'><input class='app-checkbox' id='app-checkbox' type='checkbox' onChange='onAppSelection()' value='" + app + "'>" + app.substring(4) + "</label>"
        );
    }
    var checkboxes = $('.app-checkbox');
    checkboxes.forEach(function(box) {
        box.checked = true;
    });
}

function referenceQuery(url, target, selection) {
    $.ajax({
        type: "POST",
        url: url,
        data: {
            collection: target,
            selection: selection,
            type: "query"
        },
        dataType: 'json',
        success: function(data) {
            if (data.content.length > 0) {
                if (data.type === "temporal_info_schema") {
                    var formatter = d3.time.format.utc("%Y-%m-%d %H:%M:%S");
                    $('#temporal-info').text(formatter(new Date(data.content[0].btime * 1000)));
                    $('#timezone-info').text(data.content[0].timezone.replace(/_/g, ' '));
                    $('#running-time').text(
                        Math.round(data.content[0].uptime / 3600) + 'h : ' +
                        Math.round(data.content[0].uptime % 3600 / 60) + 'm : ' +
                        data.content[0].uptime % 3600 % 60 + 's'
                    );
                }
            } else {
                showAlert("no records found!");
            }
        },
        error: function(xhr, type) {
            showAlert("search query error!");
        }
    });
}

function resetProgressBar() {
    $('#progress-indicator').css("width", 0);
}

function hideProgressBar() {
    $('#progress-bar').animate({"bottom": -20}, 500, "ease", resetProgressBar);
}

function showProgressBar() {
    $('#progress-indicator').animate({"width": "100%"}, 1000, "ease", hideProgressBar);
}

function showAlert(message, auto_remove) {
    $('body').append("<div class='alert'><button type='button' data-dismiss='alert' class='close' >&times;</button>" + message + "</div>");
    if (auto_remove)
        $('.alert').animate({opacity: 0.8}, 3000, "ease", function() {
            $('.alert').remove();
        });
}

//FIXME ------ to be defined -----------
function queryKernelLog() {
    var dmesg_query = {};
    if (dmesg_selection.val() != '') {
        var keywords = dmesg_selection.val().split(' ');
        dmesg_query.event = keywords.join('|');
    } else {
        showAlert("No keywords specified");
        return;
    }

    var start_time = Number($('#time-window-start').val());
    var end_time = Number($('#time-window-end').val());
    if (start_time > end_time) {
        showAlert("Invalid time window");
        return;
    } else {
        //dmesg_query.date = {'$gte': start_time, '$lte': end_time};
    }
    dmesg_query = JSON.stringify(dmesg_query);

    $.ajax({
        type: "POST",
        url: "dmesg_aggregation",
        data: {
            selection: dmesg_query,
            type: "query"
        },
        dataType: 'json',
        success: function(data) {
            if (data.content.length > 0) {
                var dmesg_result = [];
                data.content.forEach(function(record, index) {
                    for (var timestamp in record.value) {
                        if (record.value.hasOwnProperty(timestamp)) {
                            record.value[timestamp].content.forEach(function(message) {
                                var unified_record = {};
                                unified_record._id = index;
                                unified_record.object = record._id;
                                unified_record.date = timestamp;
                                unified_record.display = index;
                                unified_record.level = "";
                                unified_record.msg = message;
                                dmesg_result.push(unified_record);
                            });
                        }
                    }
                });
                console.log(dmesg_result);
            } else {
                showAlert("no records found!");
            }
        },
        error: function(xhr, type) {
            showAlert("search query error!");
        }
    });
}

function getFileActivity(app_name) {
    $.ajax({
        type: "POST",
        url: "file_activity",
        data: {
            selection: app_name,
            type: "exec"
        },
        dataType: 'json',
        success: function(data) {
            if (data.content !== "") {
                var result = JSON.parse(data.content)[0];
                var file_dataset = [];
                for (var timestamp in result.detail) {
                    if (result.detail.hasOwnProperty(timestamp) && timestamp !== 'id') {
                        result.detail[timestamp].forEach(function(event) {
                            var file_activity = {};
                            // filesystem record
                            file_activity._id = result.detail.id;
                            file_activity.object = event.name;
                            file_activity.date = Number(timestamp);
                            file_activity.msg = event.file_activity;
                            file_activity.level = event.inode_activity.inode;
                            file_activity.display = result.detail.id;
                            file_dataset.push(file_activity);
                            // inode record
                            for (var type = 0; type <= 2; ++type) { // 0: access, 1: change, 2: modify
                                file_dataset.push(generateInodeActivity(event, type));
                            }
                        });
                    }
                }
                file_dataset.sort(function(x, y) {
                    if (x.date <= y.date) return -1;
                    if (x.date > y.date) return 1;
                });
                console.log(file_dataset);
            } else {
                showAlert("no file activity records found!");
            }
        },
        error: function(xhr, type) {
            showAlert("file activity query error!");
        }
    });
}
// -------------------------------------

function initTimeRange(start_ts, end_ts) {
    var ts_range = [];
    // time diff less/equal than 5 hours --> 1 hour interval for display
    // time diff less/equal than 10 hours --> 3 hours interval for display
    // time diff greater than 10 hours --> 5 hours interval for display
    var time_diff = end_ts - start_ts; // convert to seconds
    var interval = time_diff <= 60 * 60 * 5 ? 60 * 60 : time_diff <= 60 * 60 * 10 ? 60 * 60 * 3 : 60 * 60 * 5;
    var point = start_ts;
    for ( ; point < end_ts; point += interval) {
        ts_range.push(point);
    }
    ts_range.push(end_ts);
    return [ts_range, interval]; // return time range array for display and interval
}

function fillTimeWindow(start_date, end_date) {
    var window_start = $('#time-window-start');
    var window_end = $('#time-window-end');
    window_start.children().remove();
    window_end.children().remove();
    var time_range = initTimeRange(start_date, end_date);
    time_range[0].forEach(function(timestamp, index) {
        var formatter = d3.time.format.utc("%Y-%m-%d %H:%M:%S");
        var disp_date = formatter(new Date(timestamp * 1000));
        if (index !== time_range[0].length - 1)
            window_start.append("<option value=" + timestamp + ">" + disp_date + "</option>");
        if (index !== 0)
            window_end.append("<option value=" + timestamp + ">" + disp_date + "</option>");
    });
    window_end.val(time_range[0][1]); // show the current window
    return time_range[1]; // return the display interval to Timeline instance
}

function updateTimeWindow(anchor_start, step) {
    $('#time-window-start').val(anchor_start);
    $('#time-window-end').val(anchor_start + step);
}

//FIXME ------------- to be deprecated ---------------
/*
function generateApplicationTimeline() {
    $.ajax({
        type: "POST",
        url: "app_timeline",
        data: {
            selection: "am_", //FIXME temp implementation
            type: "exec"
        },
        dataType: 'json',
        success: function(data) {
            if (data.content !== "" && data.error === 0) {
                var stack_dataset = JSON.parse(data.content);
                //console.log(stack_dataset.dataset);
                new StackedGraph("#aggregation-arena", stack_dataset.dataset, stack_dataset.anchor_time);
            } else {
                showAlert("error occurred or no records");
            }
        },
        error: function(xhr, type) {
            showAlert("delta query error!");
        }
    });
}
*/

function generateDeltaTimeGraph(dataset) {
    $('#aggregation-arena').children().remove(); // remove old graph
    /*
     * {
     *      <delta_t>:  {
     *                      delta_time: <delta_t>
     *                      signature: [[<Object A>, <Object B>], ...]
     *                      content: [[[obj_a, msg_a, pid_a], [obj_b, msg_b, pid_b], ...], ...]
     *                      count: [<#>, ...]
     *                  }
     *      <delta_t>:
     * }
     *  index of signature goes into content and count fields
     */
    function isInterested(target) {
        for (var index in pairs_of_interest) {
            if (index === undefined) continue;
            if (pairs_of_interest[index][0] === target[0] &&
                pairs_of_interest[index][1] === target[1]
            ) {
                return true;
            }
        }
        return false;
    }

    //FIXME to be refined
    var pairs_of_interest = [
        ["am_proc_start", "am_proc_died"],
        //["ActivityManager", "ActivityManager"],
        //["notification_enqueue", "notification_cancel"],
        //["NotificationService", "notification_cancel"],
        //["am_create_activity", "am_finish_activity"],
        //["am_pause_activity", "am_resume_activity"],
        //["am_pause_activity", "am_restart_activity"],
        ["db_sample", "db_sample"],
        ["content_query_sample", "content_query_sample"]
    ];
    var delta_dataset = {};
    for (var app_process in dataset) {
        //TODO deal with suspects later
        if (app_process === undefined || app_process === "suspects") continue;
        var length = dataset[app_process].length;
        // iterate through each app_process, calculate delta time between two events of interest
        if (length === 1) continue; // only one event recorded, ignore ...
        var index = 0, round = 0;
        for (index = round + 1; index < length; index++) {
            var current_pair = [dataset[app_process][round].object, dataset[app_process][index].object];
            //FIXME define a set of interesting system call pairs, only do delta time analysis on the defined set
            if (isInterested(current_pair)) {
                var delta_t = dataset[app_process][index].date - dataset[app_process][round].date;
                var obj_a = dataset[app_process][round].object;
                var obj_b = dataset[app_process][index].object;
                var pid_a = dataset[app_process][round].pid;
                var pid_b = dataset[app_process][index].pid;
                var msg_a = dataset[app_process][round].msg;
                var msg_b = dataset[app_process][index].msg;
                if (delta_dataset[delta_t] === undefined) {
                    delta_dataset[delta_t] = {};
                    delta_dataset[delta_t].delta_time = delta_t;
                    delta_dataset[delta_t].signature = [];
                    delta_dataset[delta_t].content = [];
                    delta_dataset[delta_t].count = [];
                }
                var signature = [];
                //
                // signaure: [[obj_a, msg_tokens], [obj_b, msg_tokens]]
                //
                signature.push([obj_a].concat(tokenize(obj_a, msg_a)));
                signature.push([obj_b].concat(tokenize(obj_b, msg_b)));
                var target_signature = [].concat(signature);
                var cmp_signatures = [].concat(delta_dataset[delta_t].signature);
                var sig_index = isSignatureKnown(cmp_signatures, target_signature);
                var content = []; // content: [[msg_a, pid_a], [msg_b, pid_b]]
                content[0] = [obj_a, msg_a, pid_a];
                content[1] = [obj_b, msg_b, pid_b];
                if (sig_index === -1) {
                    delta_dataset[delta_t].signature.push(signature);
                    delta_dataset[delta_t].content.push(content);
                    delta_dataset[delta_t].count.push(1);
                } else {
                    delta_dataset[delta_t].content[sig_index] = delta_dataset[delta_t].content[sig_index].concat(content);
                    delta_dataset[delta_t].count[sig_index] += 1;
                }
            }
            if (index === length - 1) { // when reach the end, start next round
                round += 1;
                index = round + 1;
            }
        } // for-loop index
    } // for-loop app_process

    /*
        graph_dataset
        {
            key: <delta_t>
            values: [{signature: <sig>, count: <count>}, ...]
            content: [[[obj_a, msg_a, pid_a], [obj_b, msg_b, pid_b]], ...]
        }

    */
    var graph_dataset_buf = {};
    for (var delta_t in delta_dataset) {
        if (delta_t === undefined) continue;
        delta_dataset[delta_t].signature.forEach(function(sig, index) {
            if (graph_dataset_buf[delta_t] === undefined) {
                graph_dataset_buf[delta_t] = {delta_time: delta_t, values: [], content: []};
            }
            var value = {};
            value.signature = sig;
            value.count = delta_dataset[delta_t].count[index];
            graph_dataset_buf[delta_t].values.push(value);
            var content;
            content = delta_dataset[delta_t].content[index];
            graph_dataset_buf[delta_t].content.push(content);
        });
    }

    var graph_dataset = [];
    for (var delta_t in graph_dataset_buf) {
        if (delta_t === undefined) continue;
        graph_dataset.push(graph_dataset_buf[delta_t]);
    }
    new DeltaTimeGraph("#aggregation-arena", graph_dataset);
}

function drawApplicationTraces() {
    $.ajax({
        type: "POST",
        url: "application_trace",
        data: {
            type: "exec"
        },
        dataType: 'json',
        success: function(data) {
            if (data.content !== "") {
                path_dataset = {}; // app_name: [path data]
                dataset = [];
                var app_traces = JSON.parse(data.content);

                for (var _index in app_traces) {
                    if (_index === undefined) continue;
                    // prepare dataset for application trace graph
                    var application_trace = app_traces[_index].content;
                    var path_groups = [];

                    for (var process in application_trace) {
                        if (application_trace.hasOwnProperty(process)) { // pid or suspects
                            application_trace[process].forEach(function(record) {
                                var _object = record.object + "[" + record.pid + "]";
                                record.pid = app_traces[_index].name;
                                record.object = _object;
                                if (process === "suspects") {
                                    record.level = process + "-" + app_traces[_index].name;
                                } else {
                                    record.level = process;
                                }
                                dataset.push(record);
                            });
                            if (application_trace[process].length > 0) {
                                if (process === "suspects") {
                                    path_groups.push(process + "-" + app_traces[_index].name);
                                } else {
                                    path_groups.push(process);
                                }
                            }
                        }
                    }
                    path_dataset[app_traces[_index].name] = path_groups;
                }
                var generic_data = new GenericData(data.type, dataset);
                dataset = generic_data.unifyDataset();
                $('#timeline_main').children().remove();
                timeline_main.clearData(true, true);
                timeline_main.initTimeline();
                timeline_main.setDataset(dataset, path_dataset, false, false);
                fillAppResponsivePane(path_dataset);
                $('#progress-bar').animate({"bottom": 0}, 100, "ease", showProgressBar);
                //$('#zoom-out').css('opacity', 0.8).css('z-index', 50);
            } else {
                showAlert("no records found!");
            }
        },
        error: function(xhr, type) {
            showAlert("trace query error!");
        }
    });
}

function generateInodeActivity(event, type) { // type: 0 - access, 1 - meta data, 2 - file content
    inode_activity = event.inode_activity;
    file_activity = {};
    file_activity._id = inode_activity.uid;
    file_activity.object = event.name;
    file_activity.level = inode_activity.inode;
    file_activity.display = inode_activity.uid + "[inode]";
    switch(type) {
        case 0:
            file_activity.date = inode_activity.access;
            file_activity.msg = ".a..";
            break;
        case 1:
            file_activity.date = inode_activity.change;
            file_activity.msg = "m...";
            break;
        case 2:
            file_activity.date = inode_activity.modify;
            file_activity.msg = "..c.";
            break;
    }
    return file_activity;
}

// buttons not in use
/*
app_trace_search_btn.click(function() {
    timeline_extend.clearData(true, true);
    traceApplication();
});

expand_btn.click(function() {
    dataset_extend = []; // clear old dataset
    timeline_extend.clearData(true, true);
    drawExtendTimeline();
});

filter_btn.click(function() {
    var filtered_dataset;
    if (current_dataset.length === 0) current_dataset = dataset;

    // time window filter
    var start_time = Number($('#time-window-start').val());
    var end_time = Number($('#time-window-end').val());
    if (start_time > end_time) {
        showAlert("Invalid time window");
        return;
    } else {
        filtered_dataset = dataset.filter(function(record) {
            return (record.date >= start_time && record.date <= end_time);
        });
    }

    var filtered_dataset_backup = filtered_dataset;
    // selection filter, picking up specified records from the original dataset
    if (selection.val() != '') {
        var filter_conditions = selection.val().split(' ');
        filtered_dataset = filtered_dataset.filter(function(record) {
            var matched = 0;
            filter_conditions.forEach(function(condition) {
                matched ^= (record.object.indexOf(condition) != -1 || record.msg.indexOf(condition) != -1);
            });
            if (matched === 1) return record;
        });
    }
    if (filtered_dataset.length == 0) {
        showAlert("Keywords do not exist!");
        filtered_dataset = filtered_dataset_backup;
    }

    filtered_dataset_backup = filtered_dataset; // backup filtered dataset after time and keywords
    // object or id specification filter, ticking out on particular object or id
    var obj_filter = object_pane.val();
    var id_filter = id_pane.val();
    if (obj_filter != '' && id_filter == '') {
        filtered_dataset = filtered_dataset.filter(function(record) {
            return (record.object == obj_filter);
        });
    } else if (id_filter != '' && obj_filter == '') {
        filtered_dataset = filtered_dataset.filter(function(record) {
            return (record._id == id_filter);
        });
    } else if (id_filter != '' && obj_filter != '') {
        showAlert('Invalid filter condition');
    }

    if (filtered_dataset.length == 0) {
        showAlert("Object/Id filtering returned empty!");
        filtered_dataset = filtered_dataset_backup;
    }
    // reset display in all panes except for aggregation graph & extend timeline
    clearPanes(true, false, false, false);
    fillPanes(filtered_dataset);
    object_pane.val(obj_filter);
    id_pane.val(id_filter);
    fillResponsivePane(filtered_dataset);
    // adjust display of time window
    //resetTimeRange();
    //initTimeRange(filtered_dataset);
    $('#time-window-start').val(start_time);
    $('#time-window-end').val(end_time);
    // re-draw timeline graph
    $('#next-main').css('opacity', 0).css('z-index', -1);
    $('#previous-main').css('opacity', 0).css('z-index', -1);
    // remove time brush on filter applied
    $('#time-brush').children().remove();
    timeline_main.clearData(true, false);
    timeline_main.initTimeline();
    timeline_main.setDataset(filtered_dataset, null, false, false);
    // make changes to the current dataset (for responsive panes), keep initial dataset unchanged
    current_dataset = filtered_dataset;
    $('#undo').css('opacity', 0.8).css('z-index', 100);
});

clear_btn.click(function() {
    $('#arena').children().text("Show results here...");
    $('#aggregation-arena').children().remove();
    $('#time-brush').children().remove();
    clearPanes(true, true, true, true);
    resetTimeRange();
    timeline_main.clearData(true, true);
    timeline_extend.clearData(true, true);
    $('#undo').css('opacity', 0).css('z-index', -1);
    $('#trash').css('opacity', 0).css('z-index', -1);
    $('#next-main').css('opacity', 0).css('z-index', -1);
    $('#previous-main').css('opacity', 0).css('z-index', -1);
    $('#next-extend').css('opacity', 0).css('z-index', -1);
    $('#previous-extend').css('opacity', 0).css('z-index', -1);
    dataset = [];
    current_dataset = [];
    timeline_main.clearData(true, true);
    drawMainTimeline(true);
});
*/

// button actions
dmesg_search_btn.click(function() {
    queryKernelLog();
});

file_activity_search_btn.click(function() {
    var app_name = $('#app-name-display').text();
    getFileActivity(app_name);
});

dropdown_btn.click(function() {
    var aggregation_pane = $('#aggregation-pane');
    var dropdown_ctrl = $('.dropdown-ctrl');
    if (dropdown_pane_collapsed === 1) { // show the pane
        dropdown_pane_collapsed = 0;
        aggregation_pane.animate({"top": 0}, 300, "ease");
        dropdown_ctrl.css("-webkit-transform", "rotate(0deg)");
        dropdown_ctrl.css("-moz-transform", "rotate(0deg)");
        dropdown_ctrl[0].setAttribute("title", "Collapse aggregation pane");
        // switch the active tab in responsive pane
        $('#responsive-app-pane').removeClass('active');
        $('#extend-tab').addClass('active');
        $('#app-nav').removeClass('active');
        $('#extend-nav').addClass('active');
        // hide side control bars
        $('#responsive-pane').animate({"right": -300}, 500, "ease");
        $('#main-ctrl-pane').animate({"left": -300}, 500, "ease");
        // show right control button
        $('#open-right-ctrl').css('opacity', 0.8).css('z-index', 50);
    } else { // hide the pane
        dropdown_pane_collapsed = 1;
        aggregation_pane.animate({"top": -865}, 300, "ease");
        dropdown_ctrl.css("-webkit-transform", "rotate(180deg)");
        dropdown_ctrl.css("-moz-transform", "rotate(180deg)");
        dropdown_ctrl[0].setAttribute("title", "Expand aggregation pane");
        // switch the active tab in responsive pane
        $('#extend-tab').removeClass('active');
        $('#responsive-app-pane').addClass('active');
        $('#extend-nav').removeClass('active');
        $('#app-nav').addClass('active');
        // show side control bars
        $('#responsive-pane').animate({"right": -280}, 500, "ease");
        $('#main-ctrl-pane').animate({"left": -280}, 500, "ease");
        // hide right control button
        $('#open-right-ctrl').css('opacity', 0).css('z-index', -1);
    }
});

popup_btn.click(function() {
    var event_pane = $('#event-detail-pane');
    var popup_ctrl = $('.popup-ctrl');
    if (popup_pane_collapsed == 1) { // show the pane
        popup_pane_collapsed = 0;
        popup_ctrl.css("-webkit-transform", "rotate(180deg)");
        popup_ctrl.css("-moz-transform", "rotate(180deg)");
        popup_ctrl[0].setAttribute("title", "Collapse event pane");
        event_pane.animate({"bottom": 0}, 500, "ease");
    } else { // hide the pane
        popup_pane_collapsed = 1;
        popup_ctrl.css("-webkit-transform", "rotate(0deg)");
        popup_ctrl.css("-moz-transform", "rotate(0deg)");
        popup_ctrl[0].setAttribute("title", "Expand event pane");
        event_pane.animate({"bottom": -400}, 500, "ease");
    }
});

slide_right_btn.click(function() {
    var responsive_pane = $('#responsive-pane');
    var slide_right_ctrl = $('.slide-right-ctrl');
    if (slide_right_pane_collapsed == 1) { // show the pane
        slide_right_pane_collapsed = 0;
        slide_right_ctrl.css("-webkit-transform", "rotate(180deg)");
        slide_right_ctrl.css("-moz-transform", "rotate(180deg)");
        slide_right_ctrl[0].setAttribute("title", "Collapse responsive pane");
        responsive_pane.animate({"right": 0}, 500, "ease");
    } else { // hide the pane
        slide_right_pane_collapsed = 1;
        slide_right_ctrl.css("-webkit-transform", "rotate(0deg)");
        slide_right_ctrl.css("-moz-transform", "rotate(0deg)");
        slide_right_ctrl[0].setAttribute("title", "Expand responsive pane");
        if (dropdown_pane_collapsed === 1)
            responsive_pane.animate({"right": -280}, 500, "ease");
        else
            responsive_pane.animate({"right": -300}, 500, "ease");
    }
});

slide_left_btn.click(function() {
    var main_ctrl_pane = $('#main-ctrl-pane');
    var slide_left_ctrl = $('.slide-left-ctrl');
    if (slide_left_pane_collapsed == 1) { // show the pane
        slide_left_pane_collapsed = 0;
        slide_left_ctrl.css("-webkit-transform", "rotate(0deg)");
        slide_left_ctrl.css("-moz-transform", "rotate(0deg)");
        slide_left_ctrl[0].setAttribute("title", "Collapse control pane");
        main_ctrl_pane.animate({"left": 0}, 500, "ease");
    } else { // hide the pane
        slide_left_pane_collapsed = 1;
        slide_left_ctrl.css("-webkit-transform", "rotate(180deg)");
        slide_left_ctrl.css("-moz-transform", "rotate(180deg)");
        slide_left_ctrl[0].setAttribute("title", "Expand control pane");
        main_ctrl_pane.animate({"left": -280}, 500, "ease");
    }
});

aggregate_btn.click(function() {
    $('#aggregation-arena').children().remove(); // clear previous graph
    var obj_filter = $('#objects').val();
    var pid_filter = $('#pids').val();
    var aggregation_opt;
    var aggr_selection = {};
    var aggr_collections = ["events", "main", "system"];
    var counter = aggr_collections.length;
    //FIXME this var should be global in order to enable responsive filtering
    var aggr_content = [];

    if (obj_filter === '' && pid_filter === '') {
        showAlert("No aggregation target selected");
        return;
    }

    // set aggregation type and selection criteria
    if (obj_filter !== '') {
        aggregation_opt = 'object';
        aggr_selection['object'] = obj_filter;
    }
    if (pid_filter !== '') {
        aggregation_opt = 'pid';
        aggr_selection['pid'] = pid_filter;
    }

    for (var collection_index in aggr_collections) {
        if (collection_index === undefined) continue;
        $.ajax({
            type: "POST",
            url: "/mapreduce",
            data: {
                type: "mapreduce",
                collection: aggr_collections[collection_index],
                selection: JSON.stringify(aggr_selection),
                aggregation: aggregation_opt
            },
            dataType: 'json',
            success: function(data) {
                aggr_content = _.union(aggr_content, data.content);
                counter -= 1;
                if (counter === 0) {
                    var aggr_target;
                    if (aggregation_opt === 'object') {
                        aggr_target = obj_filter;
                    } else {
                        aggr_target = pid_filter;
                    }
                    aggregationOnCompletion(aggregation_opt, aggr_target, aggr_content);
                }
            },
            error: function(xhr, type) {
                showAlert("aggregation query error!");
                counter -= 1;
            }
        });
    }
});

function aggregationOnCompletion(type, target, content) {
    var result = {};
    result.type = type;
    if (type === 'object') {
        result.object = target;
    } else {
        result._id = target;
    }
    result.content = content;
    var aggregated_graph = new AggregatedGraph("#aggregation-arena", result);
    $('#progress-bar').animate({"bottom": 0}, 100, "ease", showProgressBar);
}

// click to go to the previous time window
$('#backward').click(function() {
    if (timeline_main.start_index !== 0) {
        timeline_main.previousDisplayWindow();
        if (timeline_main.start_index === 0)
            $('#backward').css('opacity', 0).css('z-index', -1);
        $('#forward').css('opacity', 0.8).css('z-index', 50);
    }
});

// click to go to next time window
$('#forward').click(function() {
    // if have more windows to show
    if (timeline_main.end_index !== timeline_main.dataset.length - 1) {
        timeline_main.nextDisplayWindow(); // show next time window
        if (timeline_main.end_index === timeline_main.dataset.length - 1) // if no more windows to show
            $('#forward').css('opacity', 0).css('z-index', -1); // hide this button
        $('#backward').css('opacity', 0.8).css('z-index', 50); // show previous window button
    }
});

// click to show right control pane when aggregation pane is opened
$('#open-right-ctrl').click(function() {
    var responsive_pane = $('#responsive-pane');
    var slide_right_ctrl = $('.slide-right-ctrl');
    slide_right_pane_collapsed = 0;
    slide_right_ctrl.css("-webkit-transform", "rotate(180deg)");
    slide_right_ctrl.css("-moz-transform", "rotate(180deg)");
    slide_right_ctrl[0].setAttribute("title", "Collapse responsive pane");
    responsive_pane.animate({"right": 0}, 500, "ease");
});

// bootstrap function, init the basic application trace timeline
window.onLoad = function() {
    // clear dataset for new data
    dataset = [];
    current_dataset = [];
    timeline_main.clearData(true, true);
    // fetch temporal info of the device
    referenceQuery("temporal_info", "temporal", null);
    drawApplicationTraces();
}();






