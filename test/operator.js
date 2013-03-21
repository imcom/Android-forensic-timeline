
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
var object_pane = $('#objects');
var pid_pane = $('#pids');
var responsive_pid_pane = $('#responsive-pids');

var dataset = [];

function onPidSelection() {
    var pid_checkboxs = $('input[type="checkbox"]');
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
    $('#arena').children().text(JSON.stringify(display_dataset, undefined, 4));
}

function fillResponsivePane() {
     var pids = [];
     dataset.forEach(function(record) {
        if ($.inArray(record.pid, pids) == -1) {
            responsive_pid_pane.append(
                "<label type='checkbox inline'><input type='checkbox' onChange='onPidSelection()' value='" + record.pid + "'>" + record.pid + "</label>"
            );
            pids.push(record.pid);
        }
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
    if (clear_all) responsive_pid_pane.children().remove();
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

search_btn.click(function(){
    dataset = [];
    var sel = formSelection();
    $.ajax({
        type: "POST",
        url: "/test",
        data: {
            collection: collection.val(),
            selection: sel,
            fields: fields.val()
        },
        dataType: 'json',
        success: function(data){
            data.content.forEach(function(record){
                dataset.push(record);
            });
            fillPanes(dataset);
            fillResponsivePane();
            $('#arena').children().text(JSON.stringify(dataset, undefined, 4));
        },
        error: function(xhr, type){
            alert('search ajax error!');
        }
    });
});

append_btn.click(function(){
    var sel = formSelection();
    $.ajax({
        type: "POST",
        url: "/test",
        data: {
            collection: collection.val(),
            selection: sel,
            fields: fields.val()
        },
        dataType: 'json',
        success: function(data){
            data.content.forEach(function(record){
                dataset.push(record);
            });
            clearPanes(true);
            fillPanes(dataset);
            fillResponsivePane();
            $('#arena').children().text(JSON.stringify(dataset, undefined, 4));
        },
        error: function(xhr, type){
            alert('append ajax error!');
        }
    });
});

filter_btn.click(function(){
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
    fillResponsivePane();
    $('#arena').children().text(JSON.stringify(dataset, undefined, 4));
});

clear_btn.click(function(){
    $('#arena').children().text("Show results here...");
    clearPanes();
});








