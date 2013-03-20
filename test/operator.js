
$.noConflict();
$ = Zepto;

var key_1 = $('input#first');
var key_2 = $('input#second');

var btn_1 = $('button#first');
var btn_2 = $('button#second');

btn_1.click(function(){
    var collection = key_1.val();
    $.ajax({
        type: "POST",
        url: "/test",
        data: {collection: collection},
        dataType: 'json',
        success: function(data){
            $('#arena').children().text(JSON.stringify(data, undefined, 4));
        },
        error: function(xhr, type){
            alert('Ajax error!');
        }
    });
});

btn_2.click(function(){
    console.log(key_2.val());
});
