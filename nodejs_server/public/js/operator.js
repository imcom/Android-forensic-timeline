
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
var append_btn = $('#append');
var filter_btn = $('#filter');
var clear_btn = $('#clear');
var dropdown_btn = $('.dropdown-ctrl-bar');
var slide_right_btn = $('.slide-right-ctrl-bar');
var aggregate_btn = $('#aggregate-btn');

var dataset = [];
var time_range = [];
var dropdown_pane_collapsed = 1;
var slide_right_pane_collapsed = 1;

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
    var id_checkboxs = $('input[id="id-checkbox"]');
    var object_checkboxs = $('input[id="object-checkbox"]');
    var display_dataset;
    var display_ids = [];
    id_checkboxs.forEach(function(checkbox) {
        if (checkbox.checked) {
            display_ids.push(checkbox.value);
        }
    });
    display_dataset = dataset.filter(function(record) {
        return $.inArray(record._id, display_ids) != -1;
    });
    clearPanes(false, false);
    fillPanes(display_dataset);
    resetTimeRange();
    initTimeRange(display_dataset);
    updateResponsivePane(object_checkboxs, display_dataset, "object");
    timeline_main.clearData();
    timeline_main.initTimeline();
    timeline_main.setDataset(display_dataset);
}

function onObjectSelection() {
    var object_checkboxs = $('input[id="object-checkbox"]');
    var id_checkboxs = $('input[id="id-checkbox"]');
    var display_dataset = dataset;
    var display_objects = [];
    object_checkboxs.forEach(function(checkbox) {
        if (checkbox.checked) {
            display_objects.push(checkbox.value);
        }
    });
    display_dataset = dataset.filter(function(record) {
        return $.inArray(record.object, display_objects) != -1;
    });
    clearPanes(false, false);
    fillPanes(display_dataset);
    resetTimeRange();
    initTimeRange(display_dataset);
    updateResponsivePane(id_checkboxs, display_dataset, "_id");
    timeline_main.clearData();
    timeline_main.initTimeline();
    timeline_main.setDataset(display_dataset);
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
    });
    $("#ids option").click(function() {
        object_pane.val(null);
    });
}

function clearPanes(clear_responsive, clear_aggregation) {
    object_pane.children().remove();
    id_pane.children().remove();
    var window_start = $('#time-window-start');
    var window_end = $('#time-window-end');
    window_start.children().remove();
    window_end.children().remove();
    $('#timeline_main').children().remove();
    $('#timeline_extend').children().remove();
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


    var sel = {};
    if (selection.val() != '') {
        sel = JSON.parse(selection.val());
    }
    /*var date_sel = {};
    if (dkeyword != '') {
        if (stime != '' && etime != '') {
            date_sel = {$gte: Number(stime), $lte: Number(etime)};
        } else if (stime != '' && etime == '') {
            date_sel = {$gte: stime.val()};
        } else if (stime == '' && etime != '') {
            date_sel = {$lte: etime.val()};
        }
        sel[dkeyword] = date_sel;
    }*/
    return JSON.stringify(sel);
}

function fillMapReduceOptions(data_type) {
    aggregation_options.children().remove();
    if (data_type === 'android_logs') {
        aggregation_options.append("<option value='object'>aggregate by Object</option>");
        aggregation_options.append("<option value='id'>aggregate by ID</option>");
    }
}

search_btn.click(function() {
    dataset = []; // clear dataset for new data
    var selection = formSelection();
    var target = collection.val().split(':'); // target = [url(type), collection]
    $.ajax({
        type: "POST",
        url: target[0],
        data: {
            collection: target[1],
            selection: selection,
            //fields: fields.val() ? fields.val().split(' ') : [],
            fields: [],
            type: "query"
        },
        dataType: 'json',
        success: function(data) {
            var generic_data = new GenericData(data.type, data.content);
            dataset = generic_data.unifyDataset();
            clearPanes(true, true);
            fillPanes(dataset);
            fillResponsivePane(dataset);
            initTimeRange(dataset);
            fillMapReduceOptions(data.type);
            timeline_main.initTimeline();
            timeline_main.setDataset(dataset);
        },
        error: function(xhr, type) {
            showAlert("search query error!");
        }
    });
});

append_btn.click(function() {
    var sel = formSelection();
    $.ajax({
        type: "POST",
        url: "/imcom",
        data: {
            collection: collection.val(),
            selection: sel,
            fields: [],
            type: "query"
        },
        dataType: 'json',
        success: function(data){
            data.content.forEach(function(record){
                dataset.push(record);
            });
            clearPanes(true, false);
            fillPanes(dataset);
            fillResponsivePane(dataset);
            resetTimeRange();
            initTimeRange(dataset);
            $('#arena').children().text(JSON.stringify(dataset, undefined, 4));
        },
        error: function(xhr, type){
            alert('append ajax error!');
        }
    });
});

filter_btn.click(function() {
    var filtered_dataset = dataset;

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

    // selection filter, picking up specified records from the original dataset
    var filter_selection = null;
    if (selection.val() != '') {
        var filter_selection = JSON.parse(selection.val());
    }
    if (filter_selection != null) {
        filtered_dataset = filtered_dataset.filter(function(record) {
            var matched = true;
            for (var k in filter_selection) {
                if (fil.hasOwnProperty(k)) {
                    matched &= (record[k] == fil[k]);
                }
            }
            if (matched) return record;
        });
    }

    // object or id specification filter, picking up on particular object or id
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
    // reset display in all panes
    clearPanes(true, false);
    fillPanes(filtered_dataset);
    fillResponsivePane(filtered_dataset);
    // reset display of time window
    resetTimeRange();
    initTimeRange(filtered_dataset);
    // re-draw timeline graph
    timeline_main.clearData(true, false);
    timeline_main.initTimeline();
    timeline_main.setDataset(filtered_dataset);
    // make changes to the initial dataset
    dataset = filtered_dataset;
});

clear_btn.click(function() {
    $('#arena').children().text("Show results here...");
    $('#aggregation-arena').children().remove();
    clearPanes(true, true);
    resetTimeRange();
    timeline_main.clearData(true, true);
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

