/*
 *
 * Timeline class for generating timeline
 * Author: Imcom
 * Date: 2013-03-06
 *
 */

/*
 * Parameter:
 *      name -- specify the div to bear SVG element
 *
 */
function Timeline(name) {
    // static constant values
    this.name = name;
    this.timeline_height = 850;
    this.width = 1850;
    this.color_scale = d3.scale.category20();
    this.y_range_padding = 150;
    this.x_range_padding = 100;
    this.y_range = [this.timeline_height - this.y_range_padding, 0];
    var self = this;

    // chronological path generator
    this.time_path = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate("linear");

    // dynamically configurable values
    this.timeline;
    this.dataset = [];
    this.path_dataset = []; // for path groups and application name
    this.path_data = []; // coordinates for paths
    this.y_domain; // will be initialised in setDataset function
    this.x_range;
    this.tick_padding = 5;

    /*Disable global name $ from jQuery and reload it into Zepto*/
    jQuery.noConflict();
    $ = Zepto;

    // OpenTip config
    Opentip.styles.tooltip_style = {
        stem: true,
        hideDelay: 0.2,
        delay: 0.3,
        tipJoint: "right",
        target: true,
        borderWidth: 0
    };

    // dragging events handler (broken) & dragging timeline position handler (deprecated)
    /*
    this.drag_event = d3.behavior.drag()
        .on('dragstart', function() {
            d3.event.sourceEvent.stopPropagation();
        })
        .on('drag', function(object) {
            var event_id = this.getAttribute('id');
            var data_index = Number(event_id.split('-')[2]);
            var x = Math.max(object.radius, Math.min(self.x_range[1] - object.radius, d3.event.x));
            var y = Math.max(object.radius, Math.min(self.timeline_height - object.radius, d3.event.y))
            d3.select(this)
                .attr("cx", object.x = x)
                .attr("cy", object.y = y);

            d3.select('text[id=' + event_id + ']')
                .attr("x", object.x = x + 5)
                .attr("y", object.y = y);
            self.clearPath();
            self.path_data[data_index]['x'] = x;
            self.path_data[data_index]['y'] = y;
            self.drawPath();
        });
    var target_id;
    var origin_y;
    this.drag_timeline = d3.behavior.drag()
        .origin(Object)
        .on('dragstart', function() {
            d3.event.sourceEvent.stopPropagation();
            if (d3.event.sourceEvent.target.parentElement) {
                var id = d3.event.sourceEvent.target.parentElement.getAttribute('id');
                if (id) {
                    target_id = id;
                    origin_y = d3.event.sourceEvent.clientY;
                }
            }
        })
        .on('dragend', function() {
            var timeline_div = $('div[id=' + target_id + ']');
            var cur_margin = timeline_div.css("margin-top");
            cur_margin = parseInt(cur_margin.substr(0, cur_margin.length - 2));
            var step = d3.event.sourceEvent.clientY - origin_y;
            timeline_div.animate({"margin-top": cur_margin + step}, 500, "ease");
        });
    */
} // constructor of Timeline

// init timeline SVG and properties
Timeline.prototype.initTimeline = function() {

    this.timeline = d3.select(this.name)
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.timeline_height)
        .attr("class", "timeline-graph")
        .append("g")
        .attr("transform", "translate(10, 10)"); // timeline margins

    this.timeline.append("svg:clipPath")
        .attr("id", "timeline-clip")
        .append("svg:rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", this.width)
        .attr("height", this.timeline_height);
}

// remove this timeline
Timeline.prototype.removeTimeline = function() {
    $(this.name).children().remove();
}

Timeline.prototype.setDataset = function(dataset, path_dataset) {
    // only check for suspects for android logs
    var self = this;
    this.path_dataset = path_dataset;
    var _dataset = {};
    // group data by 1st date, 2nd _id (application), 3rd object (system call)
    dataset.forEach(function(data) {
        // these properties has nothing to do with date
        var _id = data._id;
        var object = data.object;
        var message = data.msg + "[" + data.level + "]";
        if (!_dataset.hasOwnProperty(data.date)) {
            _dataset[data.date] = {};
        }
        var date_group = _dataset[data.date];
        if (!date_group.hasOwnProperty(_id)) {
            date_group[_id] = {};
            date_group[_id].display = data.display;
            //date_group[_id].level = data.level;
            date_group[_id].content = {};
        }
        var id_group = date_group[_id];
        if (!id_group.content.hasOwnProperty(object)) {
            id_group.content[object] = [];
        }
        id_group.content[object].push(message);
    });

    // output data sample:
    // data {
    //      date: <timestamp>,
    //      _id: <id>,
    //      display: <display_name>,
    //      content: {<object> : [messages,...], <object> : [messages,...], ...}
    // }
    for (timestamp in _dataset) {
        if (timestamp != 'undefined') {
            for (record_id in _dataset[timestamp]) {
                if (record_id != 'undefined') {
                    this.updateYDomain(record_id); // form an ID array for X-axis domain
                    var display_name = _dataset[timestamp][record_id].display;
                    //var level = normal_dataset[timestamp][record_id].level;
                    this.dataset.push({
                        date: Number(timestamp),
                        _id: record_id,
                        display: display_name,
                        //level: level,
                        content: _dataset[timestamp][record_id].content
                    });
                }
            }
        }
    }

    // sort all events by date
    this.dataset.sort(function(x, y) {
        if (x.date <= y.date) return -1;
        if (x.date > y.date) return 1;
    });
    // on dataset is set, draw timeline
    this.onDataReady();

}

// prepare dataset for chronological path
Timeline.prototype.fillPathData = function(x_scale, y_scale, path_group) {
    var self = this;
    this.path_data = []; // clear the old data every time

    var path_buf = this.dataset.filter(function(data) {
        var belongs_to_group = 0;
        for (var object in data.content) {
            if (data.content.hasOwnProperty(object)) {
                data.content[object].forEach(function(message) {
                    var tag = message.substring(message.lastIndexOf('[') + 1, message.length - 1);
                    if (tag === path_group)
                        belongs_to_group += 1;
                });
            }
        }
        return belongs_to_group > 0;
    });
    path_buf.forEach(function(record) {
        var path_coords = {};
        path_coords['x'] = x_scale(new Date(record.date * 1000));
        path_coords['y'] = y_scale(record._id);
        self.path_data.push(path_coords);
    });
}

// clear chronological path
Timeline.prototype.clearPath = function() {
    this.timeline.selectAll('path#time_path').remove();
}

// draw chronological path between relevant events
Timeline.prototype.drawPath = function() {
    this.timeline.append('svg:path')
        .attr("id", "time_path")
        .attr("d", this.time_path(this.path_data))
        .attr("stroke", this.color_scale(this.path_data.length))
        .attr("stroke-width", 0.8)
        .attr("fill", "none");
}

Timeline.prototype.formatMessage = function(data) {
    var formatted_msg = "ID:&nbsp";
    formatted_msg += data._id;
    formatted_msg += "</br>";
    for (object in data.content) {
        if (object != "undefined") {
            formatted_msg += object;
            formatted_msg += ":{</br>";
            data.content[object].forEach(function(msg, index) {
                if (msg === "\r" || msg === "") {
                    msg = "empty message";
                }
                formatted_msg += ("&nbsp&nbsp" + index + ":" + msg);
                formatted_msg += "</br>";
            });
            formatted_msg += "}</br>";
        }
    }
    return formatted_msg;
}

// used for defining radius of circles
Timeline.prototype.getMessageNumber = function(data) {
    var message_number = 0;
    for (object in data.content) {
        if (object === undefined) continue;
        message_number += data.content[object].length;
    }
    return message_number;
}

// calculate a refined radius domain for better visualisation
Timeline.prototype.initRadiusDomain = function() {
    // minimum radius is 1
    var self = this;
    var max_domain = 0, max_message_number = 0, msg_number_array = [], median = 0;
    this.dataset.forEach(function(data) {
        var message_number = self.getMessageNumber(data);
        if (message_number >= max_message_number) {
            max_message_number = message_number;
        }
        msg_number_array.push(message_number);
    });
    median = d3.median(msg_number_array);
    max_domain = max_message_number > median * 2 ? Math.sqrt(max_message_number) : max_message_number;
    return [1, max_domain];
}

// init the ordinal domain (application name) for Y axis
Timeline.prototype.updateYDomain = function(y) {
    if ($.inArray(y, this.y_domain) === -1) {
        this.y_domain.push(y);
    }
}

// init X range for proper display
Timeline.prototype.initXRange = function() {
    var start_date = this.dataset[0].date;
    var end_date = this.dataset[this.dataset.length - 1].date;
    var upper_range = end_date - start_date <= 5000 ? 5000 : end_date - start_date >= 20000 ? end_date - start_date : 10000;
    return [this.x_range_padding, upper_range];
}

//TODO correct the references in operator
// clear dataset of this timeline
Timeline.prototype.clearData = function() {
    this.dataset = [];
    this.path_dataset = [];
    this.path_data = [];
    this.y_domain = [];
    this.x_range = [];
}

// draw timeline on SVG
Timeline.prototype.onDataReady = function() {

    var self = this;
    // timeline coords, color and radius functions
    function x(d) {
        return d.date;
    }

    function y(d) {
        return d._id;
    }

    function color(d) {
        return d._id;
    }

    function radius(d) {
        return self.getMessageNumber(d);
    }

    // convert epoch timestamp to date for d3 time scale and init display dataset
    var display_dataset = [];
    this.dataset.slice(this.start_index, this.end_index).forEach(function(data) {
        var display_data = {};
        var date = new Date(data.date * 1000); // convert to milliseconds
        display_data.date = date;
        display_data._id = data._id;
        display_data.content = data.content;
        display_data.display = data.display;
        display_dataset.push(display_data);
    });
    // calculate the entire time period
    var start_date = new Date(Number(this.dataset[0].date) * 1000);
    var end_date = new Date(Number(this.dataset[this.dataset.length - 1].date) * 1000);

    // define circle radius scale
    var radius_range = [10, 20];
    var radius_scale = d3.scale.pow()
        .exponent(2)
        .domain(this.initRadiusDomain())
        .range(radius_range)
        .clamp(true);

    // define Y axis scale
    var y_scale = d3.scale.ordinal()
        .domain(this.y_domain)
        .rangePoints(this.y_range, 1.0);

    // define X axis scale
    this.x_range = this.initXRange();
    var x_scale = d3.time.scale.utc()
        .domain([start_date, end_date])
        .range(this.x_range);

    // define X axis
    var x_axis = d3.svg.axis()
        .scale(x_scale)
        .orient("bottom")
        //FIXME.ticks(this.tick_unit, this.tick_step)
        .ticks(d3.time.minutes.utc, 5)
        .tickPadding(this.tick_padding)
        .tickSize(0);

    // define X axis label format
    x_axis.tickFormat(function(date) {
        formatter = d3.time.format.utc("%Y%m%d %H:%M:%S");
        return formatter(date);
    });

    // append X axis on Timeline
    this.timeline.append("g")
        .attr("class", "time-axis")
        .attr("id", "timeline_main")
        .attr("transform", "translate(0, 800)")
        .call(x_axis);

    // append gird on the timeline
    var grid = this.timeline.selectAll("line.grid-main")
        //FIXME.data(y_scale.ticks(this.tick_unit, this.tick_step))
        .data(x_scale.ticks(d3.time.minutes.utc, 5))
        .enter()
        .append("g")
        .attr("clip-path", "url(#timeline-clip)")
        .attr("class", "grid-main");

    // append lines on the grid
    grid.append("line")
        .attr("class", "grid-line-main")
        .attr("x1", x_scale)
        .attr("x2", x_scale)
        .attr("y1", 0)
        .attr("y2", 800);

    // init zoom handler
    var scale_extent = [-5, 15]; // used for zoom function
    var zoom_handler = d3.behavior.zoom()
                .x(x_scale)
                .scaleExtent(scale_extent)
                .on("zoom", zoom);

    // reset timeline scale function
    $('#reset-scale').click(function() {
        zoom_handler.scale(1);
        zoom_handler.translate([0, 0]);
        zoom();
    });
    // define timeline zoom behaviour
    function zoom() {
        // show/hide reset scale button
        if (Math.abs(zoom_handler.scale()) >= 3 || Math.abs(zoom_handler.translate()[1]) >= 1000) {
            $('.reset-scale').css('opacity', 0.8).css('z-index', 50);
        } else {
            $('.reset-scale').css('opacity', 0).css('z-index', -1);
        }
        // clear old chronological path
        self.clearPath();
        // re-draw X axis
        self.timeline.select(".time-axis").call(x_axis);
        // re-draw grid lines
        self.timeline.selectAll(".grid-line-main")
            .attr("x1", x_scale)
            .attr("x2", x_scale);
        // re-draw events (circles)
        self.timeline.selectAll(".timeline-event")
            .attr("cx", function(d) { return x_scale(d.date); });
        // re-draw chronological sequence path on timeline for application traces
        if (self.path_dataset !== null) {
            for (var app in path_dataset) {
                if (app === undefined) continue;
                path_dataset[app].forEach(function(path_group) {
                    self.fillPathData(x_scale, y_scale, path_group);
                    self.drawPath();
                });
            }
        }
    }
    // append clipping control on timeline
    this.timeline.append("svg:rect")
        .attr("class", "timeline-ctrl-pane")
        .attr("width", this.width)
        .attr("height", 80)
        .call(zoom_handler);

    // append events on timeline
    this.timeline.append('g')
        .attr("id", "events-arena")
        .attr("clip-path", "url(#timeline-clip)")
        .selectAll("circle")
        .data(display_dataset)
        .enter()
        .append("circle")
        .attr("class", "timeline-event")
        .attr("id", function(data, index){
            return "dataset" + "-" + index;
        })
        .attr("cx", function(data) {
            return x_scale(x(data));
        })
        .attr("cy", function(data) {
            return y_scale(y(data));
        })
        .attr("r", function(data) {
            return radius_scale(radius(data));
        })
        .attr("fill", function(d) {
            return self.color_scale(color(d));
        })
        .sort(function(x, y) {return radius(y) - radius(x)});

    // draw chronological paths on timeline for application traces
    if (this.path_dataset !== null) {
        for (var app in path_dataset) {
            if (app === undefined) continue;
            path_dataset[app].forEach(function(path_group) {
                self.fillPathData(x_scale, y_scale, path_group);
                self.drawPath();
            });
        }
    }

    // append graph legend (application names)
    var text_padding = 30;
    var legend = this.timeline.selectAll(".legend")
        .data(y_scale.domain().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 14 + ")"; });

    legend.append("rect")
        .attr("x", 10)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", this.color_scale);

    legend.append("text")
        .attr("x", text_padding)
        .attr("y", 5)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) { return d; });

    // set circles events handler
    $.each(display_dataset, function(index) {
        // associate OpenTip with events (circle)
        var circle = jQuery("circle#dataset" + "-" + index);
        circle.opentip(self.formatMessage(display_dataset[index]), {style: "tooltip_style"});
        // init time indicator and label on hover animation
        var time_indicator;
        var time_label;
        circle.mouseover(function(event) {
            var event_self = this;
            this.setAttribute("cursor", "pointer");
            time_indicator = self.timeline.append("line")
                .attr("class", "time-indicator")
                .attr("x1", this.getAttribute("cx"))
                .attr("x2", this.getAttribute("cx"))
                .attr("y1", 0)
                .attr("y2", 800);

            time_label = self.timeline.append("text")
                .attr("class", "time-label")
                .attr("y", 5)
                .attr("x", Number(this.getAttribute("cx")) + 5)
                .text(function() {
                    var local_date = x_scale.invert(event_self.getAttribute("cx"));
                    var formatter = d3.time.format.utc("%Y-%m-%d %H:%M:%S (UTC)");
                    return formatter(local_date);
                });
        })
        .mouseout(function(event) {
            // remove indicator and label
            this.setAttribute("cursor", null);
            time_indicator.remove();
            time_label.remove();
        });
        circle.on("click", function(event) {
            var target = event.target;
            // target id splited = [dataset, index]
            var data_index = Number(target.id.split("-")[1]);
            var data = self.dataset[data_index];
            window.popup_pane_collapsed = 0;
            $('.popup-ctrl').css("-webkit-transform", "rotate(180deg)");
            $('.popup-ctrl').css("-moz-transform", "rotate(180deg)");
            $('.popup-ctrl')[0].setAttribute("title", "Collapse event pane");
            $('#event-detail-pane').animate({"bottom": 0}, 500, "ease");
            jQuery(target.nodeName + "#" + target.id).data("opentips")[0].hide();

            // init data for popup pane display
            var date = data.date * 1000; // convert to milliseconds
            var formatter = d3.time.format.utc("%Y-%m-%d %H:%M:%S");
            var disp_date = formatter(new Date(date));
            $('#date-display').text(disp_date);
            $('#epoch-display').text(data.date);
            $('#pid-display').text(data._id);
            var table_prefix = "<tr><td>";
            var table_suffix = "</tr></td>";
            var messages = "";
            for (var object in data.content) {
                if (data.content.hasOwnProperty(object)) {
                    $('#object-tbody').append(table_prefix + object + table_suffix);
                    messages += "<" + object + ">: " + data.content[object] + "\n";
                }
            }
            $('#message-display').text(messages);
        });
    }); // text position & circles events handler

    /* debugging info */
    //console.log(start_date);
    //console.log(end_date);
    /* -------------- */

    // append time brush on popup control panel
    $('#time-brush-main').children().remove(); // remove old brush if any
    // init the time brush on extra control pane
    var time_brush = d3.select("#time-brush-main").append("svg")
        .attr("width", 1322)
        .attr("height", 60);

    var brush_scale = d3.time.scale.utc()
        .range([22, 1300])
        .domain(x_scale.domain());

    var brush_axis = d3.svg.axis()
        .scale(brush_scale)
        .tickSize(30)
        .tickPadding(0)
        .ticks(d3.time.minutes.utc, 30)
        .orient("bottom");

    brush_axis.tickFormat(function(date) {
        var formatter = d3.time.format.utc("%H:%M");
        return formatter(date);
    });

    var brush = d3.svg.brush()
        .x(brush_scale)
        .on("brush", onBrush);

    time_brush.append("g")
        .attr("class", "time-brush-axis")
        .call(brush_axis);

    time_brush.append("g")
        .attr("class", "time-brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", 0)
        .attr("height", 30);

    function onBrush() {
        if (!brush.empty()) {
            x_scale.domain(brush.extent());
            // adjust X axis
            self.timeline.select(".time-axis").call(x_axis);
            // re-draw grid lines
            self.timeline.selectAll(".grid-line-main")
                .attr("x1", x_scale)
                .attr("x2", x_scale);
            // relocate timeline events (circles)
            self.timeline.selectAll(".timeline-event")
                .attr("cx", function(d) { return x_scale(x(d)); });
            // clear old chronological path
            self.clearPath();
            // re-draw chronological sequence path on timeline for application traces
            if (self.path_dataset !== null) {
                for (var app in path_dataset) {
                    if (app === undefined) continue;
                    path_dataset[app].forEach(function(path_group) {
                        self.fillPathData(x_scale, y_scale, path_group);
                        self.drawPath();
                    });
                }
            }
        }
    }

} // function onDataReady()

//FIXME to be rewritten
Timeline.prototype.getServiceInfo = function(app_name, y_scale) {
    var self = this;
    $.ajax({
        type: "POST",
        url: "service_info",
        data: {
            selection: app_name,
            type: "exec"
        },
        dataType: 'json',
        success: function(data) {
            if (data.content !== "") {
                var result = JSON.parse(data.content);
                //FIXME this is broken
                var service_launch_date = new Date(result['launch_date'] * 1000);
                var service_last_activity_date = new Date(result['last_activity_date'] * 1000);
                var service_process_id = result.pid;
                //self.drawReferenceIndicator(y_scale);
            } else {
                showAlert("no service info available", true);
            }
        },
        error: function(xhr, type) {
            showAlert("service info query error!");
        }
    });
}
// ------------------- to be rewritten ------------------

//FIXME to be defined
Timeline.prototype.increaseDisplayStep = function() {
    this.display_step += 1800; // unit: seconds
    this.removeTimeline();
    this.initTimeline();
    this.start_index = 0;
    this.end_index = 0;
    this.getEndIndex();
    this.onDataReady(false);
}

Timeline.prototype.decreaseDisplayStep = function() {
    this.display_step -= 1800; // unit: seconds
    this.removeTimeline();
    this.initTimeline();
    this.start_index = 0;
    this.end_index = 0;
    this.getEndIndex();
    this.onDataReady(false);
}

Timeline.prototype.initTickInterval = function() {
    var unit_options = [
        d3.time.seconds.utc,
        d3.time.minutes.utc,
        d3.time.hours.utc
    ];
    var step_options = [
        1,
        5,
    ];

    var unit_index = this.display_step >= 3600 ? 2 : this.display_step >= 1800 ? 1 : 0;
    var step_index = this.display_step >= 3600 ? 0 : this.display_step >= 1800 ? 1 : 1;

    this.tick_unit = unit_options[unit_index];
    this.tick_step = step_options[step_index];
}
// ------------ to be defined --------------------









