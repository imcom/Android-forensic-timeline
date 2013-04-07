
/*Disable global name $ from jQuery and reload it into Zepto*/
jQuery.noConflict();
$ = Zepto;

// query or display area
var collection = $('#collection-input');
var selection = $('#selection-input');
var object_pane = $('#objects');
var id_pane = $('#ids');
var responsive_id_pane = $('#responsive-ids');
var responsive_object_pane = $('#responsive-objects');
var aggregation_options = $('#map-reduce-type');
var aggregation_arena = $('#aggregation-arena');

window.onscroll = function(event) {
    if (window.scrollY >= window.innerHeight) {
        $('.back-to-top').css('opacity', 0.8).css('z-index', 100);
    } else {
        $('.back-to-top').css('opacity', 0).css('z-index', -1);
    }
}

// control buttons
var search_btn = $('#search');
var expand_btn = $('#expand');
var filter_btn = $('#filter');
var clear_btn = $('#clear');
var dropdown_btn = $('.dropdown-ctrl-bar');
var slide_right_btn = $('.slide-right-ctrl-bar');
var aggregate_btn = $('#aggregate-btn');

var dataset = [];
var dataset_extend = [];
var current_dataset = [];
var time_range = [];
var dropdown_pane_collapsed = 1;
var slide_right_pane_collapsed = 1;
var object_selected = false;
var id_selected = false;

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
    if (current_dataset.length == 0) current_dataset = dataset;
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
    timeline_main.setDataset(display_dataset, false);
}

function onObjectSelection() {
    if (current_dataset.length == 0) current_dataset = dataset;
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
    timeline_main.setDataset(display_dataset, false);
}

function fillResponsivePane(target_set) {
    var ids = [];
    var objects = [];
    target_set.forEach(function(record) {
        if ($.inArray(record._id, ids) == -1) {
            responsive_id_pane.append(
                "<label type='checkbox inline'><input id='id-checkbox' type='checkbox' onChange='onIdSelection()' value='" + record._id + "'>" + record._id + "</label>"
            );
            ids.push(record._id);
        }
        if ($.inArray(record.object, objects) == -1) {
            responsive_object_pane.append(
                "<label type='checkbox inline'><input id='object-checkbox' type='checkbox' onChange='onObjectSelection()' value='" + record.object + "'>" + record.object + "</label>"
            );
            objects.push(record.object);
        }
    });
    var checkboxes = $('input[type="checkbox"]');
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
            object_pane.val(null);
            object_selected = false;
        } else {
            object_selected = true;
        }
    });
    $("#ids option").click(function() {
        object_pane.val(null);
        object_selected = false;
        if (id_selected) {
            id_pane.val(null);
            id_selected = false;
        } else {
            id_selected = true;
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

function drawMainTimeline() {
    var selection = formSelection();
    var target = collection.val().split(':'); // target = [url(type), collection]
    $.ajax({
        type: "POST",
        url: target[0],
        data: {
            collection: target[1],
            selection: selection,
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
                timeline_main.setDataset(dataset, check_suspects);
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
                console.log(data);
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
    var selection = JSON.parse(formSelection());
    if (selection == null) selection = {};
    // set the time window
    var start_time = Number($('#time-window-start').val());
    var end_time = Number($('#time-window-end').val());
    if (start_time > end_time) {
        showAlert("Invalid time window");
        return;
    } else {
        selection.date = {'$gt': start_time, '$lt': end_time};
    }
    selection = JSON.stringify(selection);

    var target = collection.val().split(':'); // target = [url(type), collection]
    $.ajax({
        type: "POST",
        url: target[0],
        data: {
            collection: target[1],
            selection: selection,
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
                timeline_extend.setDataset(dataset_extend, check_suspects);
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

search_btn.click(function() {
    dataset = []; // clear dataset for new data
    timeline_main.clearData(true, true);
    drawMainTimeline();
    referenceQuery("temporal_info", "temporal", null);
    referenceQuery("package_info", "packages", null);
});

expand_btn.click(function() {
    dataset_extend = []; // clear old dataset
    timeline_extend.clearData(true, true);
    drawExtendTimeline();
});

filter_btn.click(function() {
    var filtered_dataset;
    if (current_dataset.length == 0) current_dataset = dataset;

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
    timeline_main.clearData(true, false);
    timeline_main.initTimeline();
    timeline_main.setDataset(filtered_dataset, false);
    // make changes to the current dataset (for responsive panes), keep initial dataset unchanged
    current_dataset = filtered_dataset;
    $('#undo').css('opacity', 0.8).css('z-index', 100);
});

clear_btn.click(function() {
    $('#arena').children().text("Show results here...");
    $('#aggregation-arena').children().remove();
    clearPanes(true, true, true, true);
    resetTimeRange();
    timeline_main.clearData(true, true);
    timeline_extend.clearData(true, true);
    $('#undo').css('opacity', 0).css('z-index', -1);
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
    var aggr_collection = collection.val().split(':')[1];

    if (aggregation_options.val() === 'aggregate by ...') {
        showAlert("No aggregation available");
        return;
    }

    var generic_data = new GenericData(collection.val().split(':')[0], null); // no need for dataset
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
    timeline_main.setDataset(current_dataset, false);
    $('#undo').css('opacity', 0).css('z-index', -1);
});



