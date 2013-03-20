
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

var dataset = [];

function fillPanes() {
    var objects = [];
    var pids = [];
    dataset.forEach(function(record) {
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

function clearPanes() {
    object_pane.children().remove();
    pid_pane.children().remove();
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
            fillPanes();
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
            clearPanes();
            fillPanes();
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
    clearPanes();
    fillPanes();
    $('#arena').children().text(JSON.stringify(dataset, undefined, 4));
});

clear_btn.click(function(){
    $('#arena').children().text("Show results here...");
    clearPanes();
});








