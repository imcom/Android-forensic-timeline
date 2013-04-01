
/*Disable global name $ from jQuery and reload it into Zepto*/
jQuery.noConflict();
$ = Zepto;

var collection = $('#collection-input');
var selection = $('#selection-input');
var fields = $('#fields-input');
var filter = $('#filter-input');

window.onscroll = function(event) {
    if (window.scrollY >= window.innerHeight) {
        $('.back-to-top').css('opacity', 0.8).css('z-index', 100);
    } else {
        $('.back-to-top').css('opacity', 0).css('z-index', -1);
    }
}

var search_btn = $('#search');
var append_btn = $('#append');
var filter_btn = $('#filter');
var clear_btn = $('#clear');
var object_pane = $('#objects');
var pid_pane = $('#pids');
var responsive_pid_pane = $('#responsive-pids');
var responsive_object_pane = $('#responsive-objects');
var dropdown_btn = $('.dropdown-ctrl-bar');
var slide_right_btn = $('.slide-right-ctrl-bar');
var aggregate_btn = $('#aggregate-btn');
var aggregation_options = $('#map-reduce-type');
var aggregation_arena = $('#aggregation-arena');

var dataset = [];
var time_range = [];
var dropdown_pane_collapsed = 1;
var slide_right_pane_collapsed = 1;

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

function onPidSelection() {
    var pid_checkboxs = $('input[id="pid-checkbox"]');
    var object_checkboxs = $('input[id="object-checkbox"]');
    var display_dataset = dataset;
    var display_pids = [];
    pid_checkboxs.forEach(function(checkbox) {
        if (checkbox.checked) {
            display_pids.push(checkbox.value);
        }
    });
    display_dataset = dataset.filter(function(record) {
        return $.inArray(record.pid, display_pids) != -1;
    });
    clearPanes(false);
    fillPanes(display_dataset);
    resetTimeRange();
    initTimeRange(display_dataset);
    updateResponsivePane(object_checkboxs, display_dataset, "object");
    $('#arena').children().text(JSON.stringify(display_dataset, undefined, 4));
}

function onObjectSelection() {
    var object_checkboxs = $('input[id="object-checkbox"]');
    var pid_checkboxs = $('input[id="pid-checkbox"]');
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
    clearPanes(false);
    fillPanes(display_dataset);
    resetTimeRange();
    initTimeRange(display_dataset);
    updateResponsivePane(pid_checkboxs, display_dataset, "pid");
    $('#arena').children().text(JSON.stringify(display_dataset, undefined, 4));
}

function fillResponsivePane(target_set) {
    var pids = [];
    var objects = [];
    target_set.forEach(function(record) {
        if ($.inArray(record.pid, pids) == -1) {
            responsive_pid_pane.append(
                "<label type='checkbox inline'><input id='pid-checkbox' type='checkbox' onChange='onPidSelection()' value='" + record.pid + "'>" + record.pid + "</label>"
            );
            pids.push(record.pid);
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
    var pids = [];
    src.forEach(function(record) {
        if ($.inArray(record.object, objects) == -1) {
            object_pane.append("<option>" + record.object + "</option>");
            objects.push(record.object);
        }
        if ($.inArray(record.pid, pids) == -1) {
            pid_pane.append("<option>" + record.pid + "</option>");
            pids.push(record.pid);
        }
    });
}

function clearPanes(clear_all) {
    object_pane.children().remove();
    pid_pane.children().remove();
    aggregation_options.children().remove();
    aggregation_options.append("<option>aggregate by ...</option>");
    var window_start = $('#time-window-start');
    var window_end = $('#time-window-end');
    window_start.children().remove();
    window_end.children().remove();
    if (clear_all) {
        responsive_pid_pane.children().remove();
        responsive_object_pane.children().remove();
    }
}

function formSelection() {
    //var stime = start_time.val();
    //var etime = end_time.val();
    //var dkeyword = date_keyword.val();
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
        aggregation_options.append("<option value='pid'>aggregate by PID</option>");
    }
}

search_btn.click(function() {
    dataset = []; // clear dataset for new data
    var selection = formSelection();
    var target = collection.val().split(':'); // target = [url, collection]
    $.ajax({
        type: "POST",
        url: target[0],
        data: {
            collection: target[1],
            selection: selection,
            fields: fields.val() ? fields.val().split(' ') : [],
            type: "query"
        },
        dataType: 'json',
        success: function(data) {
            data.content.forEach(function(record) {
                dataset.push(record);
            });
            clearPanes(true);
            fillPanes(dataset);
            fillResponsivePane(dataset);
            initTimeRange(dataset);
            fillMapReduceOptions(data.type);
            //TODO make the arguments variable and timeline div should specified from UI
            var timeline_0 = new Timeline(
                "#timeline_0",
                3000,
                [120, 400],
                5
            );
            timeline_0.initTimeline();
            timeline_0.setDataset(data);
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
            fields: fields.val(),
            type: "query"
        },
        dataType: 'json',
        success: function(data){
            data.content.forEach(function(record){
                dataset.push(record);
            });
            clearPanes(true);
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
    var dataset_buf = null;
    var date_filter = null;

    var stime = start_time.val();
    var etime = end_time.val();
    if (stime != '' && etime != '') {
        date_filter = {$gte: Number(stime), $lte: Number(etime)};
    } else if (stime != '' && etime == '') {
        date_filter = {$gte: stime.val()};
    } else if (stime == '' && etime != '') {
        date_filter = {$lte: etime.val()};
    }
    var fil = null;
    if (filter.val() != '') {
        var fil = JSON.parse(filter.val());
    }
    if (fil != null) {
        dataset_buf = dataset;
        dataset = dataset_buf.filter(function(record) {
            var matched = true;
            for (var k in fil) {
                if (fil.hasOwnProperty(k)) {
                    matched &= (record[k] == fil[k]);
                }
            }
            if (matched) return record;
        });
    }
    if (date_filter != null) {
        dataset_buf = dataset;
        dataset = dataset_buf.filter(function(record) {
            return (record.date <= date_filter.$lte && record.date >= date_filter.$gte);
        });
    }
    var obj_filter = object_pane.val();
    var pid_filter = pid_pane.val();
    if (obj_filter != '') {
        dataset_buf = dataset;
        dataset = dataset_buf.filter(function(record) {
            return (record.object == obj_filter);
        });
    }
    if (pid_filter != '') {
        dataset_buf = dataset;
        dataset = dataset_buf.filter(function(record) {
            return (record.pid == pid_filter);
        });
    }
    clearPanes(true);
    fillPanes(dataset);
    fillResponsivePane(dataset);
    resetTimeRange();
    initTimeRange(dataset);
    $('#arena').children().text(JSON.stringify(dataset, undefined, 4));
});

clear_btn.click(function() {
    $('#arena').children().text("Show results here...");
    $('#aggregation-arena').children().remove();
    clearPanes(true);
    resetTimeRange();
});
/*
time_btn.click(function() {
    var start_time = Number($('#time-window-start').val());
    var end_time = Number($('#time-window-end').val());
    if (start_time > end_time) {
        alert("Invalid time window");
    } else {
        var display_dataset = dataset;
        var display_pids = [];
        display_dataset = dataset.filter(function(record) {
            return (record.date >= start_time && record.date <= end_time);
        });
        clearPanes(true);
        fillPanes(display_dataset);
        fillResponsivePane(display_dataset);
        resetTimeRange();
        initTimeRange(display_dataset);
        $('#arena').children().text(JSON.stringify(display_dataset, undefined, 4));
    }
});*/

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
    var pid_filter = pid_pane.val();
    var selection;

    if (aggregation_options.val() === 'aggregate by ...') {
        showAlert("No aggregation available");
        return;
    }

    if (aggregation_options.val() === 'object') {
        if (obj_filter === '') {
            showAlert("No object selected");
            return;
        } else {
            selection = JSON.stringify({'object':obj_filter});
        }
    } else if (aggregation_options.val() === 'pid') {
        if (pid_filter === '') {
            showAlert("No pid selected");
            return;
        } else {
            selection = JSON.stringify({'pid':pid_filter});
        }
    }

    // time period selection

    //TODO implement sophisticated selections
    $.ajax({
        type: "POST",
        url: "/mapreduce",
        data: {
            type: "mapreduce",
            collection: collection.val(),
            selection: selection,
            aggregation: aggregation_options.val()
        },
        dataType: 'json',
        success: function(data) {

            var result = {};
            result.type = aggregation_options.val();
            if (result.type === 'object') {
                result.object = obj_filter;
            } else {
                result.object_id = pid_filter; // pid_filter and corresponding input field should be revised
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

