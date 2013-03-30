
$.noConflict();
$ = Zepto;

var collection = $('#c');
var selection = $('#s');
var fields = $('#fs');
var start_time = $('#st');
var end_time = $('#et');
var filter = $('#fr');
var date_keyword = $('#dk');

var search_btn = $('#search');
var append_btn = $('#append');
var filter_btn = $('#filter');
var clear_btn = $('#clear');
var time_btn = $('#apply-time-window');
var object_pane = $('#objects');
var pid_pane = $('#pids');
var responsive_pid_pane = $('#responsive-pids');
var responsive_object_pane = $('#responsive-objects');
var dropdown_btn = $('#dropdown-ctrl-btn');
var aggregate_btn = $('#aggregate-btn');
var aggregation_options = $('#map-reduce-type');
var aggregation_arena = $('#aggregation-arena');

var dataset = [];
var time_range = [];
var dropdown_pane_collapsed = 1;

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
}

function fillTimeWindow() {
    var window_start = $('#time-window-start');
    var window_end = $('#time-window-end');
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
    var stime = start_time.val();
    var etime = end_time.val();
    var dkeyword = date_keyword.val();
    var sel = {};
    if (selection.val() != '') {
        sel = JSON.parse(selection.val());
    }
    var date_sel = {};
    if (dkeyword != '') {
        if (stime != '' && etime != '') {
            date_sel = {$gte: Number(stime), $lte: Number(etime)};
        } else if (stime != '' && etime == '') {
            date_sel = {$gte: stime.val()};
        } else if (stime == '' && etime != '') {
            date_sel = {$lte: etime.val()};
        }
        sel[dkeyword] = date_sel;
    }
    return JSON.stringify(sel);
}

function fillMapReduceOptions(data_type) {
    if (data_type === 'main') {
        aggregation_options.append("<option value='object'>Aggregate by Object</option>");
        aggregation_options.append("<option value='pid'>Aggregate by PID</option>");
    }
}

search_btn.click(function() {
    dataset = []; // clear dataset for new data
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
        success: function(data) {
            data.content.forEach(function(record) {
                dataset.push(record);
            });
            clearPanes(true);
            fillPanes(dataset);
            fillResponsivePane(dataset);
            initTimeRange(dataset);
            fillMapReduceOptions(data.type);
            $('#arena').children().text(JSON.stringify(dataset, undefined, 4));
        },
        error: function(xhr, type) {
            alert('search ajax error!');
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
});

dropdown_btn.click(function() {
    var aggregation_pane = $('#aggregation-pane');
    if (dropdown_pane_collapsed == 1) { // show the pane
        dropdown_btn.text('hide');
        dropdown_pane_collapsed = 0;
        aggregation_pane.animate({"top": 0}, 500, "ease");
    } else { // hide the pane
        dropdown_btn.text('show');
        dropdown_pane_collapsed = 1;
        aggregation_pane.animate({"top": -670}, 500, "ease");
    }
});

aggregate_btn.click(function() {
    $('#aggregation-arena').children().remove(); // clear previous graph
    var obj_filter = object_pane.val();
    var pid_filter = pid_pane.val();
    var stime = start_time.val();
    var etime = end_time.val();
    var selection;

    if (aggregation_options.val() === '') {
        alert("no aggregation available");
        return;
    }

    if (aggregation_options.val() === 'object') {
        if (obj_filter === '') {
            alert("no object selected");
            return;
        } else {
            selection = JSON.stringify({'object':obj_filter});
        }
    } else if (aggregation_options.val() === 'pid') {
        if (pid_filter === '') {
            alert("no pid selected");
            return;
        } else {
            selection = JSON.stringify({'pid':pid_filter});
        }
    }

    // time period selection
    if (stime != '' && etime != '') {

    } else if (stime != '' && etime == '') {

    } else if (stime == '' && etime != '') {

    }

    //TODO implement sophisticated selections
    $.ajax({
        type: "POST",
        url: "/imcom",
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
            console.log(JSON.stringify(result, undefined, 4));
        },
        error: function(xhr, type) {
            alert('aggregation ajax error!');
        }
    });
});


