
// skip the height of nav buttons
var offset_0 = 35;
var offset_1 = 35;

// button down
btn = $('#ctl_panel_0').children()[0];
btn.onclick = function(){
    offset_0 += 5;
    $('#timeline_0').css("margin-top", offset_0 + "px");
};

// button up
btn = $('#ctl_panel_0').children()[1];
btn.onclick = function(){
    offset_0 -= 5;
    $('#timeline_0').css("margin-top", offset_0 + "px");
};

// button reset
btn = $('#ctl_panel_0').children()[2];
btn.onclick = function(){
    offset_0 = 35;
    $('#timeline_0').css("margin-top", offset_0 + "px");
};

// button down
btn = $('#ctl_panel_1').children()[0];
btn.onclick = function(){
    offset_1 += 5;
    $('#timeline_1').css("margin-top", offset_1 + "px");
};

// button up
btn = $('#ctl_panel_1').children()[1];
btn.onclick = function(){
    offset_1 -= 5;
    $('#timeline_1').css("margin-top", offset_1 + "px");
};

// button reset
btn = $('#ctl_panel_1').children()[2];
btn.onclick = function(){
    offset_1 = 35;
    $('#timeline_1').css("margin-top", offset_0 + "px");
};
