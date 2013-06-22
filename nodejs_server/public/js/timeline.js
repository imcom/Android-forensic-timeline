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
    //this.timeline_height = 850;
    var height_margin = 100;
    this.timeline_height = window.innerHeight - height_margin;
    //this.width = 1850;
    this.width = window.innerWidth - 50;
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
    this.extra_dataset = []; // for radio / file dataset
    this.extra_arena; // arena for displaying radio / file activities
    this.y_domain; // will be initialised in setDataset function
    this.x_range;
    this.tick_padding = 5;
    //this.time_window_interval; // interval for displaying timeline
    //this.start_index = 0;
    //this.end_index = 0;
    this.tick_unit;
    this.tick_step;

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

// prepare raw dataset for display
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
    //      _id: <app name>,
    //      display: <display_name>,
    //      content: {<object> : [messages,...], <object> : [messages,...], ...}
    // }
    for (var timestamp in _dataset) {
        if (timestamp != 'undefined') {
            for (var record_id in _dataset[timestamp]) {
                if (record_id != 'undefined') {
                    this.updateYDomain(record_id); // form an app name array for Y-axis domain
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
    // fill the time window in left control pane.
    //this.time_window_interval = fillTimeWindow(Number(this.dataset[0].date), Number(this.dataset[this.dataset.length - 1].date));
    //this.getDisplayIndices(0, 0); // set start & end to 0 for initialisation
    // on dataset is set, draw timeline
    this.onDataReady();
    //if (this.end_index !== this.dataset.length - 1)
    //    $('#forward').css('opacity', 0.8).css('z-index', 50);;
}

// prepare dataset for chronological path
Timeline.prototype.fillPathData = function(path_group) {
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
        path_coords['x'] = self.x_scale(new Date(record.date * 1000));
        path_coords['y'] = self.y_scale(record._id);
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
    // time_window_interval is in { 1 hour, 3 hours, 5 hours }
    // 1 hour --> 5000px, 3 hours --> 15000px, 5 hours --> 25000
    var upper_range = this.time_window_interval === 60 * 60 ? 5000 : this.time_window_interval === 60 * 60 * 3 ? 15000 : 25000;
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
    this.start_index = 0;
    this.end_index = 0;
    this.time_window_interval = 0;
}

// init indices for timeline display set (deprecated)
/*Timeline.prototype.getDisplayIndices = function(start, end) {
    if (start !== -1) { // init time window or get next time window
        this.start_index = start;
        this.end_index = end;
        var time_diff = this.dataset[this.end_index].date - this.dataset[this.start_index].date;
        while (this.end_index < this.dataset.length - 1 && time_diff <= this.time_window_interval) {
            this.end_index += 1;
            time_diff = this.dataset[this.end_index].date - this.dataset[this.start_index].date;
        }
    } else { // get previous time window
        this.start_index = end;
        this.end_index = end;
        var time_diff = this.dataset[this.end_index].date - this.dataset[this.start_index].date;
        while (this.start_index > 0 && time_diff <= this.time_window_interval) {
            this.start_index -= 1;
            time_diff = this.dataset[this.end_index].date - this.dataset[this.start_index].date;
        }
    }
}*/

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
    this.dataset.forEach(function(data) {
    //this.dataset.slice(this.start_index, this.end_index).forEach(function(data) {
        var display_data = {};
        var date = new Date(data.date * 1000); // convert to milliseconds
        display_data.date = date;
        display_data._id = data._id;
        display_data.content = data.content;
        display_data.display = data.display;
        display_dataset.push(display_data);
    });
    // get the entire time period
    var start_date = display_dataset[0].date;
    var end_date = display_dataset[display_dataset.length - 1].date;
    var total_period = (Number(end_date) - Number(start_date)) / 1000;

    // define circle radius scale
    var radius_range = [10, 20];
    var radius_scale = d3.scale.pow()
        .exponent(2)
        .domain(this.initRadiusDomain())
        .range(radius_range)
        .clamp(true);

    // define Y axis scale
    this.y_scale = d3.scale.ordinal()
        .domain(this.y_domain)
        .rangePoints(this.y_range, 1.0);

    // define X axis scale
    this.x_range = this.initXRange();
    this.x_scale = d3.time.scale.utc()
        .domain([start_date, end_date])
        .range(this.x_range);

    // init tick interval on X axis
    this.initTickInterval();
    // define X axis
    var x_axis = d3.svg.axis()
        .scale(this.x_scale)
        .orient("bottom")
        .ticks(this.tick_unit, this.tick_step)
        //.ticks(d3.time.minutes.utc, 5) // static test config
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
        .attr("transform", "translate(0, " + (this.timeline_height - 100) + ")")
        .call(x_axis);

    // append gird on the timeline
    var grid = this.timeline.selectAll("line.grid-main")
        .data(this.x_scale.ticks(this.tick_unit, this.tick_step))
        .enter()
        .append("g")
        .attr("clip-path", "url(#timeline-clip)")
        .attr("class", "grid-main");

    // append lines on the grid
    grid.append("line")
        .attr("class", "grid-line-main")
        .attr("x1", this.x_scale)
        .attr("x2", this.x_scale)
        .attr("y1", 0)
        .attr("y2", this.timeline_height - 100);

    // init zoom handler
    var scale_extent = [-5, 15]; // used for zoom function
    var zoom_handler = d3.behavior.zoom()
                .x(this.x_scale)
                .scaleExtent(scale_extent)
                .on("zoom", zoom);
    // init timeline animation vars
    var pause = true;
    var forward_step = 0;
    var backward_step = 0;
    // reset timeline scale function
    $('#reset-scale').click(function() {
        zoom_handler.scale(1);
        zoom_handler.translate([0, 0]);
        zoom();
        $('#reset-scale').css('opacity', 0).css('z-index', -1);
    });
    // timeline animation functions
    function forwardTimeline() {
        if (!pause) {
            zoom_handler.translate([forward_step, 0]);
            zoom();
            forward_step -= 10;
            window.setTimeout(forwardTimeline, 200);
        }
    }
    function backwardTimeline() {
        if (!pause) {
            zoom_handler.translate([backward_step, 0]);
            zoom();
            backward_step += 10;
            window.setTimeout(backwardTimeline, 200);
        }
    }
    // timeline animation control buttons
    $('#timeline-forward').click(function() {
        pause = true; // stop previous action if any
        window.setTimeout(
            function() {
                pause = false;
                forward_step = zoom_handler.translate()[0];
                forwardTimeline();
            }, 1000);
    });
    $('#timeline-backward').click(function() {
        pause = true; // stop previous action if any
        window.setTimeout(
            function() {
                pause = false;
                backward_step = zoom_handler.translate()[0];
                backwardTimeline();
            }, 1000);
    });
    $('#timeline-stop').click(function() {
        pause = true;
    });
    // define timeline zoom behaviour
    function zoom() {
        // show/hide reset scale button
        if (Math.abs(zoom_handler.scale()) >= 2 || Math.abs(zoom_handler.translate()[0]) >= 800) {
            $('#reset-scale').css('opacity', 0.8).css('z-index', 100);
        } else {
            $('#reset-scale').css('opacity', 0).css('z-index', -1);
        }
        // clear old chronological path
        self.clearPath();
        // re-draw X axis
        self.timeline.select(".time-axis").call(x_axis);
        // re-draw grid lines
        self.timeline.selectAll(".grid-line-main")
            .attr("x1", self.x_scale)
            .attr("x2", self.x_scale);
        // re-draw events (circles)
        self.timeline.selectAll(".timeline-event")
            .attr("cx", function(d) { return self.x_scale(d.date); });
        // re-draw extra events (rect)
        self.timeline.selectAll(".extra-event")
            .attr("x", function(d) { return self.x_scale(new Date(d.date * 1000)); })
        // re-draw chronological sequence path on timeline for application traces
        if (self.path_dataset !== null) {
            for (var app in path_dataset) {
                if (app === undefined) continue;
                path_dataset[app].forEach(function(path_group) {
                    self.fillPathData(path_group);
                    self.drawPath();
                });
            }
        }
    } // function zoom()
    // append clipping control on timeline
    this.timeline.append("svg:rect")
        .attr("class", "timeline-ctrl-pane")
        .attr("width", this.width)
        .attr("height", 80)
        .call(zoom_handler);

    // append a layer for File / Radio activities
    this.extra_arena = this.timeline.append('g')
        .attr("id", "extra-arena")
        .attr("clip-path", "url(#timeline-clip)");

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
            return self.x_scale(x(data));
        })
        .attr("cy", function(data) {
            return self.y_scale(y(data));
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
                self.fillPathData(path_group);
                self.drawPath();
            });
        }
    }

    // append graph legend (application names)
    var text_padding = 30;
    var legend = this.timeline.selectAll(".legend")
        .data(this.y_scale.domain().reverse())
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
                .attr("y2", self.timeline_height - 100);

            time_label = self.timeline.append("text")
                .attr("class", "time-label")
                .attr("y", 5)
                .attr("x", Number(this.getAttribute("cx")) + 5)
                .text(function() {
                    var local_date = self.x_scale.invert(event_self.getAttribute("cx"));
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
            // open popup pane
            window.popup_pane_collapsed = 0;
            $('.popup-ctrl').css("-webkit-transform", "rotate(180deg)");
            $('.popup-ctrl').css("-moz-transform", "rotate(180deg)");
            $('.popup-ctrl')[0].setAttribute("title", "Collapse event pane");
            $('#event-detail-pane').animate({"bottom": 0}, 500, "ease");
            // hide OpenTip window
            jQuery(target.nodeName + "#" + target.id).data("opentips")[0].hide();

            // init data for popup pane display
            var date = data.date * 1000; // convert to milliseconds
            var formatter = d3.time.format.utc("%Y-%m-%d %H:%M:%S");
            var disp_date = formatter(new Date(date));
            $('#date-display').text(disp_date);
            $('#epoch-display').text(data.date);
            $('#app-name-display').text(data._id);
            var table_prefix = "<tr><td>";
            var table_suffix = "</tr></td>";
            //var messages = "";
            // remove old object list
            $('#object-tbody').children().remove();
            // append current objects
            for (var object in data.content) {
                if (data.content.hasOwnProperty(object)) {
                    $('#object-tbody').append(table_prefix + object + table_suffix);
                    //messages += "<" + object + ">: " + data.content[object] + "\n";
                }
            }
            //$('#message-display').text(messages);

            // fetch service info associated with this app
            self.getServiceInfo(data._id);
            // fetch application install date & update date
            self.getApplicationInfo(data._id);
            // generate application delta timeline
            self.getAppDeltaTimeline(data._id);
            // hide SOM control pane
            on_som_generation = 0;
            // fetch application related system calls and corresponding pids
            self.getAppSystemCalls(data._id);
        });
    }); // text position & circles events handler

    /* debugging info */
    //console.log(start_date);
    //console.log(end_date);
    /* -------------- */

    // append time brush on popup control panel
    //$('#time-brush-main').children().remove(); // remove old brush if any
    // init the time brush on extra control pane
    /*var time_brush = d3.select("#time-brush-main").append("svg")
        .attr("width", window.innerWidth - 200)
        .attr("height", 60);*/

    var brush_scale = d3.time.scale.utc()
        .range([20, this.width - 50])
        .domain(this.x_scale.domain());

    // define time brush step depending on total time period
    var brush_step = total_period <= 60 * 60 * 6 ? 30 : total_period <= 60 * 60 * 24 ? 5 : 15;
    var brush_unit = total_period <= 60 * 60 * 24 ? d3.time.minutes.utc : d3.time.hours.utc;
    var brush_axis = d3.svg.axis()
        .scale(brush_scale)
        .tickSize(30)
        .tickPadding(5)
        .ticks(brush_unit, brush_step)
        .orient("bottom");

    brush_axis.tickFormat(function(date) {
        var formatter = d3.time.format.utc("%m-%d %H:%M");
        return formatter(date);
    });

    var brush = d3.svg.brush()
        .x(brush_scale)
        .on("brush", onBrush);

    //time_brush.append("g")
    this.timeline.append("g")
        .attr("class", "time-brush-axis")
        .attr("transform", "translate(0, " + (this.timeline_height - 75) + ")")
        .call(brush_axis);

    //time_brush.append("g")
    this.timeline.append("g")
        .attr("class", "time-brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", this.timeline_height - 75)
        .attr("height", 30);

    function onBrush() {
        if (!brush.empty()) {
            $('#reset-scale').css('opacity', 0.8).css('z-index', 100);
            self.x_scale.domain(brush.extent());
            // adjust X axis
            self.timeline.select(".time-axis").call(x_axis);
            // re-draw grid lines
            self.timeline.selectAll(".grid-line-main")
                .attr("x1", self.x_scale)
                .attr("x2", self.x_scale);
            // relocate timeline events (circles)
            self.timeline.selectAll(".timeline-event")
                .attr("cx", function(d) { return self.x_scale(x(d)); });
            // clear old chronological path
            self.clearPath();
            // re-draw chronological sequence path on timeline for application traces
            if (self.path_dataset !== null) {
                for (var app in path_dataset) {
                    if (app === undefined) continue;
                    path_dataset[app].forEach(function(path_group) {
                        self.fillPathData(path_group);
                        self.drawPath();
                    });
                }
            }
        }
    }

} // function onDataReady()

Timeline.prototype.appendExtraActivity = function(dataset) {
    var self = this;
    var grouped_dataset = {};
    this.extra_dataset = []; // clear old data
    this.extra_arena.selectAll('rect').remove();

    // group data by its date
    dataset.forEach(function(data) {
        var date = data.date;
        if (grouped_dataset[date] === undefined) {
            grouped_dataset[date] = {};
            grouped_dataset[date]._id = data._id;
            grouped_dataset[date].date = date;
            grouped_dataset[date].display = data._display;
            grouped_dataset[date].msg = [data.msg];
            grouped_dataset[date].object = [data.object];
        } else {
            grouped_dataset[date].msg.push(data.msg);
            grouped_dataset[date].object.push(data.object);
        }
    });

    // convert dict dataset to array dataset and store for later use
    for (var date in grouped_dataset) {
        if (date === undefined) continue;
        this.extra_dataset.push(grouped_dataset[date]);
    }

    function x(d) {
        var date = d.date * 1000;
        return new Date(date);
    }

    function dimension(d) {
        return d.msg.length * 10;
    }

    this.extra_arena
        .selectAll("rect")
        .data(this.extra_dataset)
        .enter()
        .append("rect")
        .attr("class", "extra-event")
        .attr("id", function(data, index){
            return "extra" + "-" + index;
        })
        .attr("x", function(data) {
            return self.x_scale(x(data));
        })
        .attr("y", function(data) {
            var y_range = self.y_scale.range();
            return y_range[y_range.length - 1] + 25; // always put these events on top of the timeline
        })
        .attr("width", function(data) {
            return dimension(data);
        })
        .attr("height", function(data) {
            return dimension(data);
        })
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("fill", "black")
        .attr("transform", function(data) { return "translate(" + -dimension(data) / 2 + ", 0)"; });

    for (var index in this.extra_dataset) {
        if (index === undefined) continue;
        var rect = jQuery("#extra-" + index);
        rect.opentip(
            function(data) {
                var message = "";
                data.object.forEach(function(obj, index) {
                    message += obj;
                    message += "[";
                    message += data.msg[index];
                    message += "]</br>";
                });
                return message;
            }(this.extra_dataset[index]),
            {style: "tooltip_style"}
        );
        // init time indicator and label on hover animation
        var time_indicator;
        var time_label;
        rect.mouseover(function(event) {
            var event_self = this;
            this.setAttribute("cursor", "pointer");
            time_indicator = self.timeline.append("line")
                .attr("class", "time-indicator")
                .attr("x1", this.getAttribute("x"))
                .attr("x2", this.getAttribute("x"))
                .attr("y1", 0)
                .attr("y2", 800);

            time_label = self.timeline.append("text")
                .attr("class", "time-label")
                .attr("y", 5)
                .attr("x", Number(this.getAttribute("x")) + 5)
                .text(function() {
                    var local_date = self.x_scale.invert(event_self.getAttribute("x"));
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
    }

}

// fetch related system objects & pids of the selected application
Timeline.prototype.getAppSystemCalls = function(app_name) {
    var system_objects = [];
    var system_pids = [];
    var app_related_system_calls = this.dataset.filter(function(data) {
        return data._id === app_name;
    });
    app_related_system_calls.forEach(function(data) {
        for (var record in data.content) {
            if (record === undefined) continue;
            var object = record.substring(0, record.indexOf('['));
            var pid = record.substring(record.indexOf('[') + 1, record.length - 1);
            system_objects.push(object);
            system_pids.push(pid);
        }
    });
    this.fillSystemCallsPane(_.uniq(system_objects), _.uniq(system_pids));
}

// fill system objects & pids into selection pane
Timeline.prototype.fillSystemCallsPane = function(objects, pids) {
    // remove old data in the pane
    $('#objects').children().remove();
    $('#pids').children().remove();
    // two global vars defined in operator.js
    pid_selected = false;
    object_selected = false;

    // fill in new data
    objects.forEach(function(object) {
        $('#objects').append("<option>" + object + "</option>");
    });

    pids.forEach(function(pid) {
        $('#pids').append("<option>" + pid + "</option>");
    });

    // fill in the delta pairs selection pane
    fillDeltaSelectionPane(objects);

    // defined behaviour of selection
    $("#objects option").click(function() {
        $('#pids').val(null);
        pid_selected = false;
        if (object_selected) {
            if (selected_object != $(this).val()) {
                $('#objects').val($(this).val());
                selected_object = $('#objects').val();
            } else {
                $('#objects').val(null);
                object_selected = false;
                selected_object = null;
            }
        } else {
            object_selected = true;
            selected_object = $('#objects').val();
        }
    });
    $("#pids option").click(function() {
        $('#objects').val(null);
        object_selected = false;
        if (pid_selected) {
            if (selected_pid != $(this).val()) {
                $('#pids').val($(this).val());
                selected_pid = $('#pids').val();
            } else {
                $('#pids').val(null);
                pid_selected = false;
                selected_pid = null;
            }
        } else {
            pid_selected = true;
            selected_pid = $('#pids').val();
        }
    });
}

// get delta time based timeline of selected application
Timeline.prototype.getAppDeltaTimeline = function(app_name) {
    var self = this;
    $.ajax({
        type: "POST",
        url: "delta_timeline",
        data: {
            selection: app_name,
            type: "exec"
        },
        dataType: 'json',
        success: function(data) {
            if (data.content !== '') {
                var application_trace = JSON.parse(data.content);
                //generate delta timeline dataset (defined in operator)
                delta_dataset = []; // remove old data
                delta_dataset = application_trace.content; // var is defined in operator
                generateDeltaTimeGraph(application_trace.content);
                // switch responsive ctrl pane to delta
                $('#extend-tab').removeClass('active');
                $('#extend-nav').removeClass('active');
                $('#responsive-app-pane').removeClass('active');
                $('#app-nav').removeClass('active');
                $('#delta-tab').addClass('active');
                $('#delta-nav').addClass('active');
            } else {
                showAlert("no application info available", true);
            }
        },
        error: function(xhr, type) {
            showAlert("application info query error!");
        }
    });
}

// get application install data and etc.
Timeline.prototype.getApplicationInfo = function(app_name) {
    var self = this;
    $.ajax({
        type: "POST",
        url: "content_provider_applications",
        data: {
            collection: "Applications",
            selection: JSON.stringify({name: app_name}),
            type: "query"
        },
        dataType: 'json',
        success: function(data) {
            if (data.content.length > 0) {
                var formatter = d3.time.format.utc("%Y%m%d %H:%M:%S");
                var install_date = new Date(data.content[0].first_install_date * 1000);
                var update_date = new Date(data.content[0].last_update_date * 1000);
                $('#install-date').text(formatter(install_date));
                $('#update-date').text(formatter(update_date));
            } else {
                showAlert("no application info available", true);
            }
        },
        error: function(xhr, type) {
            showAlert("application info query error!");
        }
    });
}

// get application launch date and last activity date
Timeline.prototype.getServiceInfo = function(app_name) {
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
            var display_pane = $('#launch-activity-date');
            display_pane.children().remove(); // clear old data if any
            if (data.content !== "") {
                var result = JSON.parse(data.content);
                result.forEach(function(record) {
                    var service_process_id = record['pid'];
                    var service_launch_date = new Date(record['launch_date'] * 1000);
                    var service_last_activity_date = new Date(record['last_activity_date'] * 1000);
                    var formatter = d3.time.format.utc("%Y%m%d %H:%M:%S");
                    display_pane.append("<li class='nav-header service-pid'>" + service_process_id + "</li>");
                    display_pane.append("<li class='service-time'><p>" + formatter(service_launch_date) + "</p></li>");
                    display_pane.append("<li class='service-time'><p>" + formatter(service_last_activity_date) + "</p></li>");
                });
            } else {
                showAlert("no service info available", true);
            }
        },
        error: function(xhr, type) {
            showAlert("service info query error!");
        }
    });
}

/*Timeline.prototype.nextDisplayWindow = function() {
    this.getDisplayIndices(this.end_index, this.end_index);
    this.removeTimeline();
    this.initTimeline();
    // defined in operator.js
    if (this.end_index !== this.dataset.length - 1) {
        updateTimeWindow(this.dataset[this.start_index].date, this.time_window_interval);
    } else {
        var window_start = this.dataset[0].date;
        while(true) {
            if ( window_start + this.time_window_interval < this.dataset[this.dataset.length - 1].date)
                window_start += this.time_window_interval;
            else
                break;
        }
        updateTimeWindow(window_start, this.dataset[this.end_index].date - window_start);
    }
    this.onDataReady();
}

Timeline.prototype.previousDisplayWindow = function() {
    this.getDisplayIndices(-1, this.start_index);
    this.removeTimeline();
    this.initTimeline();
    // defined in operator.js
    updateTimeWindow(this.dataset[this.start_index].date, this.time_window_interval);
    this.onDataReady();
}*/

// init X axis tick interval based on time period length
Timeline.prototype.initTickInterval = function() {
    var unit_options = [
        d3.time.minutes.utc
    ];
    var step_options = [
        5
    ];

    // currently no need to use other interval config
    var unit_index = 0;
    var step_index = 0;

    this.tick_unit = unit_options[unit_index];
    this.tick_step = step_options[step_index];
}










