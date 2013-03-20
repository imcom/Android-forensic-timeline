
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
            $('#arena').children().text(JSON.stringify(data.content, undefined, 4));
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
            content = $('#arena').children().text();
            content += "\n";
            content += JSON.stringify(data.content, undefined, 4);
            $('#arena').children().text(content);
        },
        error: function(xhr, type){
            alert('append ajax error!');
        }
    });
});

clear_btn.click(function(){
    $('#arena').children().text("Show results here...");
});








