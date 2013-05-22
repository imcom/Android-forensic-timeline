
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
var init_events_pane = $('#init-events');
var end_events_pane = $('#end-events');
var event_pairs_display_pane = $('#event-pairs-display');
var responsive_som_pane = $('#responsive-som-apps');
var threshold_input = $('#threshold-input');

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
var slide_left_som_btn = $('.slide-left-som-ctrl-bar');
var aggregate_btn = $('#aggregate-btn');
var dmesg_search_btn = $('#dmesg-search');
var show_radio_btn = $('#radio-on');
var hide_radio_btn = $('#radio-off');
var update_delta_events_btn = $('#update-event-pairs');
var add_event_pair_btn = $('#add-event-pair');
var remove_event_pair_btn = $('#remove-event-pair');
var som_btn = $('#show-som');
var threshold_apply_btn = $('#threshold-apply');
//var relevance_search_btn = $('#relevance-search');
//var app_trace_search_btn = $('#app-trace-search');
//var expand_btn = $('#expand');
//var filter_btn = $('#filter');
//var clear_btn = $('#clear');
//var search_btn = $('#search');

// global variables
var dataset = [];
var path_dataset = {};
var delta_dataset = [];
var aggr_dataset = {};
var app_traces = {};
var dropdown_pane_collapsed = 1;
var popup_pane_collapsed = 1;
var slide_right_pane_collapsed = 1;
var slide_left_pane_collapsed = 1;
var slide_left_som_pane_collapsed = 1;
var on_som_generation = 0;
var object_selected = false;
var pid_selected = false;
var selected_object;
var selected_pid;
//var current_start_time;
//var current_end_time;
var som_instance = null;
var dropdown_div_height = window.innerHeight - 80;
var dropdown_div_top = -(window.innerHeight - 100);

var pairs_of_interest = [ //TODO experimental
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

function onAggrSelection() {
    var display_dataset = {};
    display_dataset.type = aggr_dataset.type;
    display_dataset.object = aggr_dataset.object;

    var pid_checkboxes = $('input[id=pid-checkbox]');
    var object_checkboxes = $('input[id=object-checkbox]');

    var display_set = [];
    if (aggr_dataset.type === "object") {
        pid_checkboxes.forEach(function(checkbox) {
            if (checkbox.checked) {
                display_set.push(checkbox.value);
            }
        });
    } else {
        object_checkboxes.forEach(function(checkbox) {
            if (checkbox.checked) {
                display_set.push(checkbox.value);
            }
        });
    }
    display_dataset.content = aggr_dataset.content.filter(function(record) {
        return $.inArray(record._id, display_set) !== -1;
    });
    if (display_dataset.content.length === 0) { // if last pid / object is unselected then reset all
        showAlert("Empty set! Reset to origin", true);
        $("#aggregation-arena").children().remove();
        new AggregatedGraph("#aggregation-arena", aggr_dataset);
        var checkboxes = $('.aggr-checkbox');
        checkboxes.forEach(function(box){
            box.checked = true;
        });
    } else {
        $("#aggregation-arena").children().remove();
        new AggregatedGraph("#aggregation-arena", display_dataset);
    }
}

function fillResponsivePane(target_set, type) {
    var display_set = [];
    // clear old data
    responsive_pid_pane.children().remove();
    responsive_object_pane.children().remove();
    // append new data
    target_set.forEach(function(record) {
        if ($.inArray(record, display_set) === -1) {
            if (type === 'object') {
                responsive_pid_pane.append(
                    "<label type='checkbox inline'><input class='aggr-checkbox' id='pid-checkbox' type='checkbox' onChange='onAggrSelection()' value='" + record + "'>" + record + "</label>"
                );
            } else {
                responsive_object_pane.append(
                    "<label type='checkbox inline'><input class='aggr-checkbox' id='object-checkbox' type='checkbox' onChange='onAggrSelection()' value='" + record + "'>" + record + "</label>"
                );
            }
            display_set.push(record);
        }
    });
    var checkboxes = $('.aggr-checkbox');
    checkboxes.forEach(function(box){
        box.checked = true;
    });
}

function onAppSelection() {
    var app_checkboxes = $('.app-checkbox');
    var display_dataset;
    var display_apps = [];
    var display_path_set = {};
    app_checkboxes.forEach(function(checkbox) {
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

function onAppChosen(app_name) {
    var display_path_set = {};
    var display_dataset;
    if (app_name !== 'default') {
        display_path_set[app_name] = path_dataset[app_name];
        display_dataset = dataset.filter(function(record) {
            return record._id === app_name;
        });
        timeline_main.removeTimeline();
        timeline_main.clearData();
        timeline_main.initTimeline();
        timeline_main.setDataset(display_dataset, display_path_set);
        responsive_app_pane.children().remove();
    } else {
        timeline_main.removeTimeline();
        timeline_main.clearData();
        timeline_main.initTimeline();
        timeline_main.setDataset(dataset, path_dataset);
        fillAppResponsivePane(path_dataset);
    }
}

/*function onTimeChosen(selected_time, type) {
    var interval = timeline_main.time_window_interval;
    if (type === 'start') {
        var num_of_steps = (selected_time - current_start_time) / interval;
    } else {
        var num_of_steps = (selected_time - current_end_time) / interval;
    }
    if (num_of_steps < 0) { // go previous
        while (num_of_steps < 0) {
            timeline_main.previousDisplayWindow();
            num_of_steps += 1;
        }
        $('#forward').css('opacity', 0.8).css('z-index', 50);
    } else { // go next
        while (num_of_steps > 0) {
            timeline_main.nextDisplayWindow();
            num_of_steps -= 1;
        }
        $('#backward').css('opacity', 0.8).css('z-index', 50); // show previous window button
    }
    if (timeline_main.end_index === timeline_main.dataset.length - 1) // if no more windows to show
            $('#forward').css('opacity', 0).css('z-index', -1); // hide this button
    if (timeline_main.start_index === 0)
            $('#backward').css('opacity', 0).css('z-index', -1);
}*/

function onSOMAppSelection() {
    var som_app_checkboxes = $('.som-app-checkbox');
    var selected_apps = [];
    som_app_checkboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
            selected_apps.push(checkbox.value);
        }
    });
    som_instance.appendApps(selected_apps);
}

function fillAppResponsivePane(path_groups) {
    for (var app in path_groups) {
        if (app === undefined) continue;
        responsive_app_pane.append(
            "<label type='checkbox inline'><input class='app-checkbox' id='app-checkbox' type='checkbox' onChange='onAppSelection()' value='" + app + "'>" + app.substring(4) + "</label>"
        );
        responsive_som_pane.append(
            "<label type='checkbox inline'><input class='som-app-checkbox' id='som-app-checkbox' type='checkbox' onChange='onSOMAppSelection()' value='" + app + "'>" + app.substring(4) + "</label>"
        );
    }
    var checkboxes = $('.app-checkbox');
    checkboxes.forEach(function(box) {
        box.checked = true;
    });
}

function fillDeltaSelectionPane(objects) {
    // remove old data
    event_pairs_display_pane.children().remove();
    init_events_pane.children().remove();
    end_events_pane.children().remove();
    // fill in the selection pane
    for (var index in objects) {
        if (index === undefined) continue;
        init_events_pane.append("<option>" + objects[index] + "</option>");
        end_events_pane.append("<option>" + objects[index] + "</option>");
    }
    // using default setup to fill display pane
    for (var index in pairs_of_interest) {
        if (index === undefined) continue;
        event_pairs_display_pane.append("<option>" + pairs_of_interest[index].join('-') + "</option>");
    }
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
        dmesg_query.date = {'$gte': start_time, '$lte': end_time};
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
// -------------------------------------

function getRadioActivity() {
    $.ajax({
        type: "POST",
        url: "radio_activity",
        data: {
            type: "exec"
        },
        dataType: 'json',
        success: function(data) {
            if (data.content !== "") {
                var result = JSON.parse(data.content);
                timeline_main.appendExtraActivity(result);
            } else {
                showAlert("no radio activity records found!");
            }
        },
        error: function(xhr, type) {
            showAlert("radio activity query error!");
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
                var result = JSON.parse(data.content)[0]; // will be only one database entry for each app
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
                            for (var type = 0; type <= 2; ++type) { // 0: access, 1: change, 2: modified
                                file_dataset.push(generateInodeActivity(event, type));
                            }
                        });
                    }
                }
                file_dataset.sort(function(x, y) {
                    if (x.date <= y.date) return -1;
                    if (x.date > y.date) return 1;
                });
                timeline_main.appendExtraActivity(file_dataset);
            } else {
                showAlert("no file activity records found!");
            }
        },
        error: function(xhr, type) {
            showAlert("file activity query error!");
        }
    });
}

/*function initTimeRange(start_ts, end_ts) {
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
}*/

/*function fillTimeWindow(start_date, end_date) {
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
    current_start_time = $('#time-window-start').val();
    current_end_time = $('#time-window-end').val();
    return time_range[1]; // return the display interval to Timeline instance
}*/

/*function updateTimeWindow(anchor_start, step) {
    $('#time-window-start').val(anchor_start);
    $('#time-window-end').val(anchor_start + step);
    current_start_time = $('#time-window-start').val();
    current_end_time = $('#time-window-end').val();
}*/

function getInterestedPairs() {
    var pairs_buf = [];
    // get all the options in select field
    var current_pairs = event_pairs_display_pane.children();
    current_pairs.forEach(function(opt) {
        if (opt !== undefined) {
            pairs_buf.push(opt.value.split('-'));
        }
    });
    return pairs_buf;
}

function generateDeltaTimeGraph(dataset) {
    // get pairs of events of which delta timeline will be generated upon
    var interested_pairs = getInterestedPairs();
    // remove old graph
    $('#aggregation-arena').children().remove();

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
        for (var index in interested_pairs) {
            if (index === undefined) continue;
            if (interested_pairs[index][0] === target[0] &&
                interested_pairs[index][1] === target[1]
            ) {
                return true;
            }
        }
        return false;
    }

    var interested_dataset = {};
    for (var app_process in dataset) {
        //FIXME suspects are the ones missing start and ending. abandoned currently...
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
                if (interested_dataset[delta_t] === undefined) {
                    interested_dataset[delta_t] = {};
                    interested_dataset[delta_t].delta_time = delta_t;
                    interested_dataset[delta_t].signature = [];
                    interested_dataset[delta_t].content = [];
                    interested_dataset[delta_t].count = [];
                }
                var signature = [];
                //
                // signaure: [[obj_a, msg_tokens], [obj_b, msg_tokens]]
                //
                signature.push([obj_a].concat(tokenize(obj_a, msg_a)));
                signature.push([obj_b].concat(tokenize(obj_b, msg_b)));
                var target_signature = [].concat(signature);
                var cmp_signatures = [].concat(interested_dataset[delta_t].signature);
                var sig_index = isSignatureKnown(cmp_signatures, target_signature);
                var content = []; // content: [[msg_a, pid_a], [msg_b, pid_b]]
                content[0] = [obj_a, msg_a, pid_a];
                content[1] = [obj_b, msg_b, pid_b];
                if (sig_index === -1) {
                    interested_dataset[delta_t].signature.push(signature);
                    interested_dataset[delta_t].content.push(content);
                    interested_dataset[delta_t].count.push(1);
                } else {
                    interested_dataset[delta_t].content[sig_index] = interested_dataset[delta_t].content[sig_index].concat(content);
                    interested_dataset[delta_t].count[sig_index] += 1;
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
    for (var delta_t in interested_dataset) {
        if (delta_t === undefined) continue;
        interested_dataset[delta_t].signature.forEach(function(sig, index) {
            if (graph_dataset_buf[delta_t] === undefined) {
                graph_dataset_buf[delta_t] = {delta_time: delta_t, values: [], content: []};
            }
            var value = {};
            value.signature = sig;
            value.count = interested_dataset[delta_t].count[index];
            graph_dataset_buf[delta_t].values.push(value);
            var content;
            content = interested_dataset[delta_t].content[index];
            graph_dataset_buf[delta_t].content.push(content);
        });
    }

    var graph_dataset = [];
    for (var delta_t in graph_dataset_buf) {
        if (delta_t === undefined) continue;
        graph_dataset.push(graph_dataset_buf[delta_t]);
    }
    if (graph_dataset.length > 0) {
        new DeltaTimeGraph("#aggregation-arena", graph_dataset);
        // switch responsive ctrl pane to delta timeline
        $('#extend-tab').removeClass('active');
        $('#extend-nav').removeClass('active');
        $('#responsive-app-pane').removeClass('active');
        $('#app-nav').removeClass('active');
        $('#delta-tab').addClass('active');
        $('#delta-nav').addClass('active');
    } else {
        showAlert("no delta time data available", true);
    }
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
                // clear old data if any
                path_dataset = {}; // {app_name: [path data], ... }
                dataset = [];
                current_dataset = [];
                app_traces = {};
                // save raw application traces for SOM
                app_traces = JSON.parse(data.content);

                for (var _index in app_traces) {
                    if (_index === undefined) continue;
                    // prepare dataset for application trace graph
                    var application_trace = app_traces[_index].content;
                    var path_groups = [];

                    // fill in the selection list on left ctrl pane
                    var app_selector = $('#app-selections');
                    app_selector.append("<option value=" + app_traces[_index].name + ">" + app_traces[_index].name + "</option>");

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
                timeline_main.removeTimeline();
                timeline_main.clearData();
                timeline_main.initTimeline();
                timeline_main.setDataset(dataset, path_dataset);
                fillAppResponsivePane(path_dataset);
                $('#progress-bar').animate({"bottom": 0}, 100, "ease", showProgressBar);
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
            file_activity.date = inode_activity.modified;
            file_activity.msg = "..c.";
            break;
    }
    return file_activity;
}

function generateSOM(nodes) {
    on_som_generation = 1;
    // remove old graph
    $('#aggregation-arena').children().remove();
    som_instance = new SOMGraph("#aggregation-arena", nodes, app_traces);
}

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

        // hide side control bars
        $('#responsive-pane').animate({"right": -300}, 500, "ease");
        $('#main-ctrl-pane').animate({"left": -300}, 500, "ease");
        // show SOM control if it is on SOM generation
        if (on_som_generation === 1)
            $('#som-ctrl-pane').animate({"left": -280}, 500, "ease");
        // show right control button
        $('#open-right-ctrl').css('opacity', 0.8).css('z-index', 50);
    } else { // hide the pane
        dropdown_pane_collapsed = 1;
        //aggregation_pane.animate({"top": -865}, 300, "ease");
        aggregation_pane.animate({"top": dropdown_div_top}, 300, "ease");
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
        // adjust slide right ctrl icon
        $('.slide-right-ctrl').css("-webkit-transform", "rotate(0deg)");
        $('.slide-right-ctrl').css("-moz-transform", "rotate(0deg)");
        // adjust slide left ctrl icon
        $('.slide-left-ctrl').css("-webkit-transform", "rotate(180deg)");
        $('.slide-left-ctrl').css("-moz-transform", "rotate(180deg)");
        // hide SOM control
        $('#som-ctrl-pane').animate({"left": -300}, 500, "ease");
        // hide right control button
        $('#open-right-ctrl').css('opacity', 0).css('z-index', -1);
        // switch responsive ctrl pane to app
        $('#extend-tab').removeClass('active');
        $('#extend-nav').removeClass('active');
        $('#delta-tab').removeClass('active');
        $('#delta-nav').removeClass('active');
        $('#responsive-app-pane').addClass('active');
        $('#app-nav').addClass('active');
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
        event_pane.animate({"bottom": -260}, 500, "ease");
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

slide_left_som_btn.click(function() {
    var som_ctrl_pane = $('#som-ctrl-pane');
    var slide_left_ctrl = $('.slide-left-ctrl');
    if (slide_left_som_pane_collapsed == 1) { // show the pane
        slide_left_som_pane_collapsed = 0;
        slide_left_ctrl.css("-webkit-transform", "rotate(0deg)");
        slide_left_ctrl.css("-moz-transform", "rotate(0deg)");
        slide_left_ctrl[0].setAttribute("title", "Collapse control pane");
        som_ctrl_pane.animate({"left": 0}, 500, "ease");
    } else { // hide the pane
        slide_left_som_pane_collapsed = 1;
        slide_left_ctrl.css("-webkit-transform", "rotate(180deg)");
        slide_left_ctrl.css("-moz-transform", "rotate(180deg)");
        slide_left_ctrl[0].setAttribute("title", "Expand control pane");
        som_ctrl_pane.animate({"left": -280}, 500, "ease");
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
                if (data.error === 0) {
                    aggr_content = _.union(aggr_content, data.content);
                } else {
                    showAlert("Error! [" + data.type + "]:</br>" + data.content, true);
                }
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

som_btn.click(function() {
    $.ajax({
        type: "POST",
        url: "som",
        data: {
            type: "exec"
        },
        dataType: 'json',
        success: function(data) {
            if (data.content.length > 0) {
                var nodes = JSON.parse(data.content);
                generateSOM(nodes);
            } else {
                showAlert("no SOM data found!");
            }
        },
        error: function(xhr, type) {
            showAlert("SOM query error!");
        }
    });
});

add_event_pair_btn.click(function() {
    var init = init_events_pane.val();
    var end = end_events_pane.val();
    if (init === "" || end === "") {
        showAlert("not enough events selected", true);
        return;
    }
    event_pairs_display_pane.append("<option>" + init + '-' + end + "</option>");
});

remove_event_pair_btn.click(function() {
    var pair = event_pairs_display_pane.val();
    if (pair === "") {
        showAlert("no events pair selected", true);
        return;
    }
    $('#event-pairs-display option').forEach(function(opt) {
        if (opt !== undefined) {
            if (opt.value === pair) opt.remove();
        }
    });
});

update_delta_events_btn.click(function() {
    generateDeltaTimeGraph(delta_dataset);
});

threshold_apply_btn.click(function() {
    var threshold = threshold_input.val();
    som_instance.onThresholdChange(threshold);
});

function aggregationOnCompletion(type, target, content) {
    aggr_dataset = {}; // clear old data
    //var result = {};
    aggr_dataset.type = type;
    if (type === 'object') {
        aggr_dataset.object = target;
    } else {
        aggr_dataset._id = target;
    }
    aggr_dataset.content = content;
    var aggregated_graph = new AggregatedGraph("#aggregation-arena", aggr_dataset);
    // append showed objects / pids on responsive pane
    fillResponsivePane(aggregated_graph.y_domain_array, type);
    $('#progress-bar').animate({"bottom": 0}, 100, "ease", showProgressBar);
    // switch the active tab in responsive pane
    $('#responsive-app-pane').removeClass('active');
    $('#app-nav').removeClass('active');
    $('#delta-tab').removeClass('active');
    $('#delta-nav').removeClass('active');
    $('#extend-tab').addClass('active');
    $('#extend-nav').addClass('active');
    // hide SOM control pane
    on_som_generation = 0;
}

// click to go to the previous time window
/*$('#backward').click(function() {
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
});*/

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

show_radio_btn.click(function() {
    getRadioActivity();
});

hide_radio_btn.click(function() {
    timeline_main.extra_arena.selectAll('rect').remove();
});

// bootstrap function, init the basic application trace timeline
window.onLoad = function() {
    // hide SOM ctrl pane to the right on app start
    $('#som-ctrl-pane').animate({"left": -300}, 100, "ease");
    // fetch temporal info of the device
    referenceQuery("temporal_info", "temporal", null);
    drawApplicationTraces();
    // define the app selector behaviour
    $('#app-selections').on("change", function() {
        onAppChosen($(this).val());
    });
    $('.dropdown-div').css("height", dropdown_div_height);
    $('.dropdown-div').css("top", dropdown_div_top);
    $('#event-metadata').css("width", 200);
    $('#aggr-selection').css("width", 240);
    $('#app-temporal-info').css("width", 260).css("margin-left", -5);
    $('.popup-div').css("margin-left", (window.innerWidth - $('.popup-div').width()) / 2);
    $('.dropdown-div').css("margin-left", (window.innerWidth - $('.dropdown-div').width()) / 2);
    $('#responsive-som-apps').css("max-height", $('#som-ctrl-pane').height() - 110);
    $('#responsive-apps').css("max-height", $('#responsive-pane').height() - 90);
    $('#responsive-pids').css("max-height", $('#responsive-pane').height() - 90);
    $('#responsive-objects').css("max-height", $('#responsive-pane').height() - 90);
    /*$('#time-window-start').on("change", function() {
        onTimeChosen($(this).val(), 'start');
    });
    $('#time-window-end').on("change", function() {
        onTimeChosen($(this).val(), 'end');
    });*/
}();






