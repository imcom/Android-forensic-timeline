
/*Disable global name $ from jQuery and reload it into Zepto*/
jQuery.noConflict();
$ = Zepto;

// query or display area
var collection = $('#collection-input');
var selection = $('#selection-input');
var dmesg_selection = $('#dmesg-selection-input');
var file_activity_selection = $('#file-activity-selection-input');
var relevance_selection = $('#relevance-selection-input');
var app_trace_selection = $('#app-trace-selection-input');
var object_pane = $('#objects');
var id_pane = $('#ids');
var responsive_id_pane = $('#responsive-ids');
var responsive_object_pane = $('#responsive-objects');
var responsive_id_pane_extend = $('#responsive-ids-extend');
var aggregation_options = $('#map-reduce-type');
var aggregation_arena = $('#aggregation-arena');

window.onscroll = function(event) {
    if (window.scrollY >= window.innerHeight) {
        $('.back-to-top').css('opacity', 0.8).css('z-index', 100);
    } else {
        $('.back-to-top').css('opacity', 0).css('z-index', -1);
    }
};

// control buttons
//var search_btn = $('#search');
var dmesg_search_btn = $('#dmesg-search');
var file_activity_search_btn = $('#file-activity-search');
var relevance_search_btn = $('#relevance-search');
var app_trace_search_btn = $('#app-trace-search');
var expand_btn = $('#expand');
var filter_btn = $('#filter');
var clear_btn = $('#clear');
var dropdown_btn = $('.dropdown-ctrl-bar');
var popup_btn = $('.popup-ctrl-bar');
var slide_right_btn = $('.slide-right-ctrl-bar');
var aggregate_btn = $('#aggregate-btn');

var dataset = [];
var dataset_extend = [];
var current_dataset = [];
var time_range = [];
var dropdown_pane_collapsed = 1;
var popup_pane_collapsed = 1;
var slide_right_pane_collapsed = 1;
var object_selected = false;
var id_selected = false;
var selected_object;
var selected_id;

var timeline_main = new Timeline("#timeline_main");
var timeline_extend = new Timeline("#timeline_extend");

function initTimeRange(target_set) {
    target_set.forEach(function(record) {
        var timestamp = record.date;
        if ($.inArray(timestamp, time_range) == -1) {
            time_range.push(timestamp);
        }
    });
    fillTimeWindow();
}

function resetTimeRange() {
    time_range = [];
    var window_start = $('#time-window-start');
    var window_end = $('#time-window-end');
    window_start.children().remove();
    window_end.children().remove();
    window_start.append("<option>from...</option>");
    window_end.append("<option>to...</option>");
}

function fillTimeWindow() {
    var window_start = $('#time-window-start');
    var window_end = $('#time-window-end');
    window_start.children().remove();
    window_end.children().remove();
    time_range.forEach(function(timestamp) {
        var date = timestamp * 1000; // convert to milliseconds
        var formatter = d3.time.format.utc("%Y%m%d %H:%M:%S");
        var disp_date = formatter(new Date(date));
        window_start.append("<option value=" + timestamp + ">" + disp_date + "</option>");
        window_end.append("<option value=" + timestamp + ">" + disp_date + "</option>");
    });
    window_end.val("" + time_range[time_range.length - 1]);
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

function onExtendIdSelection() {
    var id_checkboxs = $('.extend-checkbox');
    var display_dataset;
    var display_ids = [];
    id_checkboxs.forEach(function(checkbox) {
        if (checkbox.checked) {
            display_ids.push(checkbox.value);
        }
    });
    display_dataset = dataset_extend.filter(function(record) {
        return $.inArray(record.level, display_ids) != -1;
    });
    timeline_extend.removeTimeline();
    timeline_extend.clearData(true, true);
    timeline_extend.initTimeline();
    timeline_extend.setDataset(display_dataset, null, false, false);
}

function fillExtendResponsivePane(path_groups) {
    var ids = [];
    path_groups.forEach(function(path_group) {
        responsive_id_pane_extend.append(
            "<label type='checkbox inline'><input class='extend-checkbox' id='id-checkbox' type='checkbox' onChange='onExtendIdSelection()' value='" + path_group + "'>" + path_group + "</label>"
        );
    });
    var checkboxes = $('.extend-checkbox');
    checkboxes.forEach(function(box){
        box.checked = true;
    });
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

function formSelection() {
    //if (collection.val().split(':')[0] === 'android_logs') { // this is the only collection supported
    if (selection.val() != '') { // always use OR logic in query
        var regex_selection = {};
        regex_selection['$or'] = [];
        var keywords = selection.val().split(' ');
        regex_selection['$or'].push({object : keywords.join('|')});
        regex_selection['$or'].push({msg : keywords.join('|')});
        return JSON.stringify(regex_selection);
    } else {
        return null;
    }
    //} else {
    //    return null; // null selection for any other collections
    //}
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
                        Math.round(data.content[0].uptime / 3600) + 'h ' +
                        Math.round(data.content[0].uptime % 3600 / 60) + 'm ' +
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

function drawExtendTimeline() {
    var extend_selection = JSON.parse(formSelection());
    if (extend_selection == null) extend_selection = {};
    // set the time window
    var start_time = Number($('#time-window-start').val());
    var end_time = Number($('#time-window-end').val());
    if (start_time > end_time) {
        showAlert("Invalid time window");
        return;
    } else {
        extend_selection.date = {'$gte': start_time, '$lte': end_time};
    }
    extend_selection = JSON.stringify(extend_selection);

    var target = collection.val().split(':'); // target = [url(type), collection]
    $.ajax({
        type: "POST",
        url: target[0],
        data: {
            collection: target[1],
            selection: extend_selection,
            type: "query"
        },
        dataType: 'json',
        success: function(data) {
            if (data.content.length > 0) {
                var generic_data = new GenericData(data.type, data.content);
                dataset_extend = generic_data.unifyDataset();
                $('#timeline_extend').children().remove();
                timeline_extend.initTimeline();
                var check_suspects = false;
                if (data.type === 'android_logs') check_suspects = true;
                timeline_extend.setDataset(dataset_extend, null, check_suspects, false);
                $('#progress-bar').animate({"bottom": 0}, 100, "ease", showProgressBar);
            } else {
                showAlert("no records found!");
            }
        },
        error: function(xhr, type) {
            showAlert("search query error!");
        }
    });
    $('#trash').css('opacity', 0.8).css('z-index', 50);
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

function showAlert(message) {
    $('body').append("<div class='alert'><button type='button' data-dismiss='alert' class='close' >&times;</button>" + message + "</div>");
}

function aggregateDmesg() {
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
                dataset_extend = [];
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
                                dataset_extend.push(unified_record);
                            });
                        }
                    }
                });
                $('#timeline_extend').children().remove();
                timeline_extend.initTimeline();
                var check_suspects = false;
                timeline_extend.setDataset(dataset_extend, null, check_suspects, false);
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

function drawDeltaTimeline() {
    $.ajax({
        type: "POST",
        url: "delta_timeline",
        data: {
            selection: "am_",
            type: "exec"
        },
        dataType: 'json',
        success: function(data) {
            if (data.content !== "" && data.error === 0) {
                var stack_dataset = JSON.parse(data.content);
                new StackedGraph("#aggregation-arena", stack_dataset);
            } else {
                showAlert("error occurred or no records");
            }
        },
        error: function(xhr, type) {
            showAlert("delta query error!");
        }
    });
}

function traceApplication() {
    var app_name;
    if (app_trace_selection.val() != '') {
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
                $('#zoom-out').css('opacity', 0.8).css('z-index', 50);
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

function fileActivity() {
    var app_name;
    if (file_activity_selection.val() != '') {
        app_name = file_activity_selection.val();
    } else {
        showAlert("No application specified");
        return;
    }

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
                var result = JSON.parse(data.content);
                dataset_extend = [];
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
                            dataset_extend.push(file_activity);
                            // inode record
                            for (var type = 0; type <= 2; ++type) { // 0: access, 1: change, 2: modify
                                dataset_extend.push(generateInodeActivity(event, type));
                            }
                        });
                    }
                }
                dataset_extend.sort(function(x, y) {
                    if (x.date <= y.date) return -1;
                    if (x.date > y.date) return 1;
                });
                $('#timeline_extend').children().remove();
                timeline_extend.clearData(true, true);
                timeline_extend.initTimeline();
                var check_suspects = false;
                timeline_extend.setDataset(dataset_extend, null, check_suspects, false);
                $('#progress-bar').animate({"bottom": 0}, 100, "ease", showProgressBar);
                $('#zoom-out').css('opacity', 0.8).css('z-index', 50);
            } else {
                showAlert("no records found!");
            }
        },
        error: function(xhr, type) {
            showAlert("file activity query error!");
        }
    });
}

//TODO remove search button, instead, showing Events timeline onLoad
/*search_btn.click(function() {
    dataset = []; // clear dataset for new data
    current_dataset = [];
    timeline_main.clearData(true, true);
    drawMainTimeline();
    referenceQuery("temporal_info", "temporal", null);
    referenceQuery("package_info", "packages", null);
});*/

file_activity_search_btn.click(function() {
    timeline_extend.clearData(true, true);
    fileActivity();
});

app_trace_search_btn.click(function() {
    timeline_extend.clearData(true, true);
    traceApplication();
});

dmesg_search_btn.click(function() {
    timeline_extend.clearData(true, true);
    aggregateDmesg();
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

dropdown_btn.click(function() {
    var aggregation_pane = $('#aggregation-pane');
    var dropdown_ctrl = $('.dropdown-ctrl');
    if (dropdown_pane_collapsed == 1) { // show the pane
        dropdown_pane_collapsed = 0;
        dropdown_ctrl.css("-webkit-transform", "rotate(0deg)");
        dropdown_ctrl.css("-moz-transform", "rotate(0deg)");
        dropdown_ctrl[0].setAttribute("title", "Collapse aggregation pane");
        aggregation_pane.animate({"top": 0}, 500, "ease");
    } else { // hide the pane
        dropdown_pane_collapsed = 1;
        dropdown_ctrl.css("-webkit-transform", "rotate(180deg)");
        dropdown_ctrl.css("-moz-transform", "rotate(180deg)");
        dropdown_ctrl[0].setAttribute("title", "Expand aggregation pane");
        aggregation_pane.animate({"top": -680}, 500, "ease");
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
        event_pane.animate({"bottom": -300}, 500, "ease");
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
        responsive_pane.animate({"right": -280}, 500, "ease");
    }
});

aggregate_btn.click(function() {
    $('#aggregation-arena').children().remove(); // clear previous graph
    var obj_filter = object_pane.val();
    var id_filter = id_pane.val();
    var aggr_selection = {};
    //var aggr_collection = collection.val().split(':')[1];
    var aggr_collection = "events";

    if (aggregation_options.val() === 'aggregate by ...') {
        showAlert("No aggregation available");
        return;
    }

    //var generic_data = new GenericData(collection.val().split(':')[0], null); // no need for dataset
    var generic_data = new GenericData("android_logs", null); // no need for dataset
    //TODO time period selection & other condition selections
    if (aggregation_options.val() === 'object') {
        if (obj_filter === '') {
            showAlert("No object selected");
            return;
        } else {
            var obj_field = generic_data.getObjectField();
            aggr_selection[obj_field] = obj_filter;
        }
    } else if (aggregation_options.val() === 'id') {
        if (id_filter === '') {
            showAlert("No id selected");
            return;
        } else {
            var id_field = generic_data.getIdField();
            aggr_selection[id_field] = id_filter;
        }
    }

    //TODO implement sophisticated selections
    $.ajax({
        type: "POST",
        url: "/mapreduce",
        data: {
            type: "mapreduce",
            collection: aggr_collection,
            selection: JSON.stringify(aggr_selection),
            aggregation: aggregation_options.val()
        },
        dataType: 'json',
        success: function(data) {
            var result = {};
            result.type = aggregation_options.val();
            if (result.type === 'object') {
                result.object = obj_filter;
            } else {
                result._id = id_filter; // id_filter and corresponding input field should be revised
            }
            result.content = data.content;
            //TODO visualize the aggregation results
            var aggregated_graph = new AggregatedGraph("#aggregation-arena", result);
            $('#progress-bar').animate({"bottom": 0}, 100, "ease", showProgressBar);
        },
        error: function(xhr, type) {
            showAlert("aggregation query error!");
        }
    });
});

$('#undo').click(function() {
    current_dataset = dataset;
    // reset display in all panes except for aggregation graph & extend timeline
    clearPanes(true, false, false, true);
    fillPanes(current_dataset);
    fillResponsivePane(current_dataset);
    // adjust display of time window
    resetTimeRange();
    initTimeRange(current_dataset);
    // re-draw timeline graph
    timeline_main.clearData(true, false);
    timeline_main.initTimeline();
    timeline_main.setDataset(current_dataset, null, false, true);
    $('#undo').css('opacity', 0).css('z-index', -1);
});

$('#trash').click(function() {
    timeline_extend.clearData(true, true);
    $('#timeline_extend').children().remove();
    $('#trash').css('opacity', 0).css('z-index', -1);
});

$('#next-main').click(function() {
    $('#timeline_main').children().remove();
    timeline_main.initTimeline();
    timeline_main.nextWindow();
});

$('#previous-main').click(function() {
    $('#timeline_main').children().remove();
    timeline_main.initTimeline();
    timeline_main.previousWindow();
});

$('#next-extend').click(function() {
    $('#timeline_extend').children().remove();
    timeline_extend.initTimeline();
    timeline_extend.nextWindow();
});

$('#previous-extend').click(function() {
    $('#timeline_extend').children().remove();
    timeline_extend.initTimeline();
    timeline_extend.previousWindow();
});

$('#zoom-out').click(function() {
    timeline_extend.increaseDisplayStep();
    if (timeline_extend.display_step >= 7200) {
        $('#zoom-out').css('opacity', 0).css('z-index', -1);
    }
    $('#zoom-in').css('opacity', 0.8).css('z-index', 50);
});

$('#zoom-in').click(function() {
    timeline_extend.decreaseDisplayStep();
    if (timeline_extend.display_step === 20) {
        $('#zoom-in').css('opacity', 0).css('z-index', -1);
        $('#zoom-out').css('opacity', 0.8).css('z-index', 50);
    }
});

window.onLoad = function() {
    dataset = []; // clear dataset for new data
    current_dataset = [];
    timeline_main.clearData(true, true);
    drawMainTimeline(true);
    referenceQuery("temporal_info", "temporal", null);
    //referenceQuery("package_info", "packages", null); // this collection is used for filesystem activity query
    drawDeltaTimeline();
}();



