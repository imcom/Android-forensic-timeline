/*
 *
 * Timeline class for generating timeline
 * Author: Imcom
 * Date: 2013-03-06
 *
 */

/*
 * name: div to draw
 *
 */
function Timeline(name) {
    // static constant values
    this.name = name;
    this.y_range_padding = 20; // this number can be a constant, padding from the window top
    this.x_range = [160, 660];
    this.x_range_padding = 160;
    this.timeline_height = 800;
    this.display_step = 20;

    // dynamically configurable values
    this.dataset = [];
    this.start_index = 0;
    this.end_index = 0;
    this.suspects = [];
    this.timeline;
    this.y_range;
    this.tick_padding = 5;
    this.tick_unit;
    this.tick_step;
    this.color_scale;
    this.x_domain_array = [];
    this.y_domain_min = 0;
    this.y_domain_max = 0;

    /*Disable global name $ from jQuery and reload it into Zepto*/
    jQuery.noConflict();
    $ = Zepto;

    Opentip.styles.tooltip_style = {
        stem: true,
        hideDelay: 0.2,
        delay: 0.3,
        tipJoint: "right", //Opentip can auto adjust left/right for display
        target: true,
        borderWidth: 0
    };
    var self = this;
    this.path_data = [];
    this.time_path = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate("monotone");

    // dragging events handler (not working...)
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
        });*/
    // dragging timeline position handler (deprecated)
    /*
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

Timeline.prototype.updateXDomain = function(x) {
    if ($.inArray(x, this.x_domain_array) == -1) {
        this.x_domain_array.push(x);
    }
}

Timeline.prototype.updateYDomain = function(y) {
    if (
        this.y_domain_min == 0 &&
        this.y_domain_max == 0
    ) {
        this.y_domain_min = y;
        this.y_domain_max = y;
    } else {
        if (y < this.y_domain_min) {
            this.y_domain_min = y;
        } else if (y > this.y_domain_max) {
            this.y_domain_max = y;
        }
    }
}

Timeline.prototype.getName = function() {
    return this.name;
}

Timeline.prototype.initTimeline = function() {

    this.timeline = d3.select(this.name)
        .append("svg")
        .attr("width", "100%")
        .attr("height", this.timeline_height)
        .attr("class", "timeline-graph")
        .append("g");

    this.timeline.append("svg:clipPath")
        .attr("id", "timeline-clip")
        .append("svg:rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", "100%")
        .attr("height", this.timeline_height);

} // init timeline SVG and properties

Timeline.prototype.initYRange = function() { //TODO need to refine this method for better display
    // min: 20, max: 8000; upper bound min: 600
    //var upper_range = this.y_domain_max - this.y_domain_min;
    //console.log("Y axis time difference: " + (this.y_domain_max - this.y_domain_min));
    //upper_range = upper_range > 1400 ? 8000 : (upper_range > 600 ? 4000 : 600);
    //return [this.y_range_padding, upper_range];
    return [this.y_range_padding, this.timeline_height];
}

Timeline.prototype.clearData = function(clear_dataset, clear_suspects) {
    if (clear_dataset) {
        this.dataset = [];
    }
    if (clear_suspects) {
        this.suspects = [];
    }
    this.y_domain_min = 0;
    this.y_domain_max = 0;
    this.x_domain_array = [];
    this.start_index = 0;
    this.end_index = 0;
}

Timeline.prototype.removeTimeline = function() {
    $(this.getName()).children('.timeline-graph').remove();
}

Timeline.prototype.setDataset = function(dataset, check_suspects, enable_time_brush) {
    // only check for suspects during initiation & do NOT check suspects upon MAC times
    var self = this;
    var normal_dataset = {};
    // check and mark abnormal chronologically placed records and store them separately
    // group data by 1st timestamp, 2nd record id, 3rd record object
    var current_date = dataset[0].date; // theoretically the first record should have the minimum date value
    dataset.forEach(function(data) {
        var suspect_data = {};
        if (data.date < current_date) { // place abnormal events
            suspect_data.date = data.date;
            suspect_data._id = data._id;
            suspect_data.display = data.display;
            var detail = {};
            detail[data.object] = [data.msg + "[" + data.level + "]"];
            suspect_data.content = detail;
            if (check_suspects)
                self.suspects.push(suspect_data);
        } else { // group normal events by date
            current_date = data.date;
            var _id = data._id;
            var object = data.object;
            var message = data.msg;
            if (!normal_dataset.hasOwnProperty(current_date)) {
                normal_dataset[current_date] = {};
            }
            var date_group = normal_dataset[current_date];
            if (!date_group.hasOwnProperty(_id)) {
                date_group[_id] = {};
                date_group[_id].display = data.display;
                date_group[_id].content = {};
            }
            var id_group = date_group[_id];
            if (!id_group.content.hasOwnProperty(object)) {
                id_group.content[object] = [];
            }
            id_group.content[object].push(message);
        }
    });

    // output data sample:
    // data {
    //      date: <timestamp>,
    //      event_id: <id>,
    //      display: <display_name>,
    //      content: {<object> : [messages,...], <object> : [messages,...], ...}
    // }
    for (timestamp in normal_dataset) {
        this.updateYDomain(timestamp); // find out max and min date
        if (timestamp != 'undefined') {
            for (record_id in normal_dataset[timestamp]) {
                if (record_id != 'undefined') {
                    this.updateXDomain(record_id); // form an ID array for X-axis domain
                    var display_name = normal_dataset[timestamp][record_id].display;
                    this.dataset.push({
                        date: timestamp,
                        _id: record_id,
                        display: display_name,
                        content: normal_dataset[timestamp][record_id].content
                    });
                }
            }
        }
    }
    // init first sub-array for display
    //this.end_index = this.dataset.length > this.display_step ? this.display_step : this.dataset.length - 1;
    this.getEndIndex();
    // on dataset is set, draw timeline
    this.onDataReady(enable_time_brush);
}

Timeline.prototype.getEndIndex = function() {
    var time_diff = this.dataset[this.end_index].date - this.dataset[this.start_index].date;
    while(time_diff < this.display_step && this.end_index < this.dataset.length) {
        this.end_index += 1;
        if (this.end_index === this.dataset.length) {
            break;
        }
        time_diff = this.dataset[this.end_index].date - this.dataset[this.start_index].date;
    }
}

Timeline.prototype.getStartIndex = function() {
    var time_diff = this.dataset[this.end_index].date - this.dataset[this.start_index].date;
    while(time_diff < this.display_step && this.start_index > 0) {
        this.start_index -= 1;
        if (this.start_index <= 0) {
            this.start_index = 0;
            break;
        }
        time_diff = this.dataset[this.end_index].date - this.dataset[this.start_index].date;
    }
}

Timeline.prototype.fillPathData = function(x_scale, y_scale, dataset) {
    var self = this;
    self.path_data = []; // clear the old data everytime
    $.each(dataset, function(index) {
        var path_coords = {};
        path_coords['x'] = x_scale(dataset[index]._id);
        path_coords['y'] = y_scale(dataset[index].date);
        self.path_data.push(path_coords);
    });
}

Timeline.prototype.clearPath = function() {
    this.timeline.select('path#time_path').remove();
}

Timeline.prototype.drawPath = function() {
    this.timeline.append('svg:path')
        .attr("id", "time_path") // to be distinguished with Y-axis timeline
        .attr("d", this.time_path(this.path_data))
        .attr("stroke", "green")
        .attr("stroke-width", 1)
        .attr("fill", "none");
}

Timeline.prototype.nextWindow = function() {
    this.start_index = this.end_index;
    this.getEndIndex();
    //this.end_index = this.dataset.length > this.start_index + this.display_step ? this.start_index + this.display_step : this.dataset.length - 1;
    if (this.start_index !== 0) {
        //TODO show the previous button
        $('#previous-' + this.name.split('_')[1]).css('opacity', 1).css('z-index', 50);
    }
    if (this.end_index === this.dataset.length) {
        //TODO hide the next button
        $('#next-' + this.name.split('_')[1]).css('opacity', 0).css('z-index', -1);
    }
    this.onDataReady(true);
}

Timeline.prototype.previousWindow = function() {
    //this.start_index = this.start_index > this.display_step ? this.start_index - this.display_step : 0;
    this.end_index = this.start_index;
    this.getStartIndex();
    //this.end_index = this.dataset.length > this.start_index + this.display_step ? this.start_index + this.display_step : this.dataset.length - 1;
    if (this.start_index === 0) {
        //TODO hide the previous button
        $('#previous-' + this.name.split('_')[1]).css('opacity', 0).css('z-index', -1);
    }
    if (this.end_index < this.dataset.length) {
        //TODO show the next button
        $('#next-' + this.name.split('_')[1]).css('opacity', 1).css('z-index', 50);
    }
    this.onDataReady(true);
}

Timeline.prototype.onDataReady = function(enable_time_brush) {
    var self = this;
    if (this.end_index !== this.dataset.length) {
        $('#next-' + this.name.split('_')[1]).css('opacity', 1).css('z-index', 50);
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
    var date_padding = 2; // unit: seconds
    //var start_date = new Date((Number(this.y_domain_min) - date_padding) * 1000);
    //var end_date = new Date((Number(this.y_domain_max) + date_padding) * 1000);
    var start_date = new Date((Number(this.dataset[this.start_index].date) - date_padding) * 1000);
    var end_date = new Date((Number(this.dataset[this.end_index - 1].date) + date_padding) * 1000);

    var suspect_display_dataset = [];
    this.suspects.forEach(function(data) {
        var suspect_display_data = {};
        var date = new Date(data.date * 1000); // convert to milliseconds
        suspect_display_data.date = date;
        suspect_display_data._id = data._id;
        suspect_display_data.content = data.content;
        suspect_display_data.display = data.display;
        suspect_display_dataset.push(suspect_display_data);
    });

    this.color_scale = d3.scale.category20();
    this.initTickInterval(); // tick unit is 5 sec constant now
    this.y_range = this.initYRange();

    // debugging info
    console.log(start_date);
    console.log(end_date);
    console.log("Suspicious event(s):");
    console.log(this.suspects);

    var x_scale = d3.scale.ordinal()
                .domain(this.x_domain_array)
                .rangePoints(this.x_range, 3.0);

    var y_scale = d3.time.scale.utc()
                .domain([
                        start_date,
                        end_date
                    ])
                .range(this.y_range);

    var radius_range = [10, 30];
    var radius_scale = d3.scale.pow()
        .exponent(2)
        .domain(this.initRadiusDomain())
        .range(radius_range)
        .clamp(true);

    // draw Y axis on timeline
    var y_axis = d3.svg.axis()
        .scale(y_scale)
        .orient("right")
        //.ticks(this.tick_unit, this.tick_step)
        .ticks(d3.time.seconds.utc, 5)
        .tickPadding(this.tick_padding)
        .tickSize(0);

    y_axis.tickFormat(function(date) {
        formatter = d3.time.format.utc("%Y%m%d %H:%M:%S");
        return formatter(date);
    });

    this.timeline.append("g")
        .attr("class", "time-axis")
        .attr("id", this.name.substr(1))
        .call(y_axis);
    adjustDateLabel();

    // draw gird lines on the timeline
    var grid = this.timeline.selectAll("line[id=" + this.name.substr(1) + "].grid")
        //.data(y_scale.ticks(this.tick_unit, this.tick_step))
        .data(y_scale.ticks(d3.time.seconds.utc, 5))
        .enter()
        .append("g")
        .attr("clip-path", "url(#timeline-clip)")
        .attr("class", "grid");

    grid.append("line")
        .attr("class", "grid-line")
        .attr("y1", y_scale)
        .attr("y2", y_scale)
        .attr("x1", 0)
        .attr("x2", "100%");

    // append clipping components
    var scale_extent = [-5, 20]; // used for zoom function
    var zoom_handle = d3.behavior.zoom()
                .y(y_scale)
                .scaleExtent(scale_extent)
                .on("zoom", zoom);

    this.timeline.append("svg:rect")
        .attr("class", "timeline-ctrl-pane")
        .attr("width", 100)
        .attr("height", this.timeline_height)
        .call(zoom_handle);

    function zoom() {
        if (zoom_handle.scale() >= 4 || Math.abs(zoom_handle.translate()[1]) >= 1500) {
            $('.reset-scale').css('opacity', 0.8).css('z-index', 50);
        } else {
            $('.reset-scale').css('opacity', 0).css('z-index', -1);
        }
        self.clearPath();
        self.timeline.select(".time-axis").call(y_axis);
        self.timeline.selectAll(".grid-line")
            .attr("y1", y_scale)
            .attr("y2", y_scale);
        self.timeline.selectAll(".timeline-event")
            .attr("cy", function(d) { return y_scale(d.date); });
        self.timeline.selectAll(".suspects")
            .attr("y", function(d) { return y_scale(d.date); });
        self.timeline.selectAll(".description")
            .attr("y", function(d) { return y_scale(d.date); });
        self.timeline.selectAll("#suspect-description")
            .attr("y", function(d) { return y_scale(d.date); });
        self.timeline.selectAll("#suspect-time-indicator")
            .attr("y1", function(d) { return y_scale(d.date); })
            .attr("y2", function(d) { return y_scale(d.date); });
        self.timeline.selectAll("#suspect-time-label")
            .attr("y", function(d) { return y_scale(d.date) - 5; });
        self.fillPathData(x_scale, y_scale, display_dataset);
        //self.drawPath();
        adjustDateLabel();
    }

    $('.reset-scale').click(function() {
        zoom_handle.scale(1);
        zoom_handle.translate([0, 0]);
        zoom();
    });

    /* adjust Y axis label position */
    function adjustDateLabel() {
        var date_labels = $("g.time-axis#" + self.name.substr(1))[0].childNodes;
        $.each(date_labels, function(index) {
            if (date_labels[index].nodeName == "g") { // filter out the path element
                date_labels[index].childNodes[1].setAttribute("dy", "-0.5em");
                date_labels[index].setAttribute("id", self.name.substr(1));
            }
        });
    }

    // coords, color and radius functions
    function x(d) {
        return d._id;
    }

    function y(d) {
        return d.date;
    }

    function color(d) {
        var time_offset = d.date.getTime() / 10 ^ 6;
        return Number(d._id) + time_offset;
    }

    function radius(d) {
        return self.getMessageNumber(d);
    }

    // draw events on timeline
    this.timeline.append('g')
        .attr("id", "events-arena")
        .attr("clip-path", "url(#timeline-clip)")
        .selectAll("circle[id=" + this.name.substr(1) + "]")
        .data(display_dataset)
        .enter()
        .append("circle")
        .attr("class", "timeline-event")
        .attr("id", function(data, index){
            return self.name.substr(1) + "-dataset" + "-" + data._id + "-" + index;
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
        //.call(this.drag_event); // drag function is not working...

    // draw abnormal events on timeline
    this.timeline.append('g')
        .attr("id", "suspect-events-arena")
        .attr("clip-path", "url(#timeline-clip)")
        .selectAll("rect")
        .data(suspect_display_dataset)
        .enter()
        .append("rect")
        .attr("id", function(data, index){
            return self.name.substr(1) + "-suspects" + "-" + data._id + "-" + index;
        })
        .attr("class", "suspects")
        .attr("x", function() {
            return self.x_range[1] - self.x_range_padding;
        })
        .attr("y", function(data) {
            return y_scale(y(data));
        })
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", function(d) {
            return self.color_scale(color(d));
        });

    // draw chronological sequence path on timeline (deprecated here...)
    //this.fillPathData(x_scale, y_scale, display_dataset);
    //this.drawPath();

    // append display name on normal events
    this.timeline.selectAll("text[id=" + this.name.substr(1) + "]")
        .data(display_dataset)
        .enter()
        .append("text")
        .attr("class", "description")
        .attr("id", this.name.substr(1))
        .text(function(data) {
            return data.display;
        })
        .attr("fill", "black");

    // set display name for suspect events
    this.timeline.selectAll("text[id=suspect-description]")
        .data(suspect_display_dataset)
        .enter()
        .append("text")
        .attr("id", "suspect-description")
        .attr("class", "description suspect-description")
        .attr("x", this.x_range[1] - this.x_range_padding + 5)
        .attr("y", function(d) {
            return y_scale(y(d));
        })
        .text(function(d) {return d.display;} );
    // draw time indicator on each suspect events
    this.timeline.selectAll("line[id=suspect-time-indicator]")
        .data(suspect_display_dataset)
        .enter()
        .append("line")
        .attr("id", "suspect-time-indicator")
        .attr("class", "time-indicator suspect-time-indicator")
        .attr("y1", function(d) {
            return y_scale(y(d));
        })
        .attr("y2", function(d) {
            return y_scale(y(d));
        })
        .attr("x1", 0)
        .attr("x2", "100%");
    this.timeline.selectAll("text[id=suspect-time-label]")
        .data(suspect_display_dataset)
        .enter()
        .append("text")
        .attr('id', "suspect-time-label")
        .attr("class", "time-label suspect-time-label")
        .attr("x", 5)
        .attr("y", function(d) {
            return y_scale(y(d)) - 5;
        })
        .text(function(d) {
            var date = new Date(y(d));
            var formatter = d3.time.format.utc("%Y-%m-%d %H:%M:%S (UTC)");
            return formatter(date);
        });
    // add mouseover animation on suspect events
    $.each(suspect_display_dataset, function(index) {
        var rect = jQuery("rect[id=" + self.name.substr(1) + "-suspects" + "-" + suspect_display_dataset[index]._id + "-" + index + "]");
        rect.opentip(self.formatMessage(suspect_display_dataset[index]), {style: "tooltip_style"});
        rect.mouseover(function(event) {
            this.setAttribute("cursor", "pointer");
        })
        .mouseout(function(event) {
            this.setAttribute("cursor", null);
        });
        rect.on("click", function(event) {
            var target = event.target;
            //console.log(target.id.split("-")); // [timeline, suspects, pid, index=(start_index + index)]
            var data_index = Number(target.id.split("-")[3]) + this.start_index;
            var data = self.suspects[data_index];
            jQuery(target.nodeName + "#" + target.id).data("opentips")[0].hide();
            window.popup_pane_collapsed = 0;
            $('.popup-ctrl').css("-webkit-transform", "rotate(180deg)");
            $('.popup-ctrl').css("-moz-transform", "rotate(180deg)");
            $('.popup-ctrl')[0].setAttribute("title", "Collapse event pane");
            $('#event-detail-pane').animate({"bottom": 0}, 500, "ease");
        });
    });

    // set display elements ids
    // add mouseover animation on events and set opentips
    var text_fields = $("text[id=" + this.name.substr(1) + "]");
    $.each(display_dataset, function(index) {
        text_fields[index].setAttribute("x", x_scale(display_dataset[index]._id) + 5);
        text_fields[index].setAttribute("y", y_scale(display_dataset[index].date));
        text_fields[index].setAttribute("id", self.name.substr(1) + "-dataset" + "-" + display_dataset[index]._id + "-" + index);

        var time_indicator;
        var time_label;
        var circle = jQuery("circle[id=" + self.name.substr(1) + "-dataset" + "-" + display_dataset[index]._id + "-" + index + "]");
        circle.opentip(self.formatMessage(display_dataset[index]), {style: "tooltip_style"});
        circle.mouseover(function(event) {
            var event_self = this;
            this.setAttribute("cursor", "pointer");
            time_indicator = self.timeline.append("line")
                .attr("class", "time-indicator")
                .attr("y1", this.getAttribute("cy"))
                .attr("y2", this.getAttribute("cy"))
                .attr("x1", 0)
                .attr("x2", "100%");

            time_label = self.timeline.append("text")
                .attr("class", "time-label")
                .attr("x", 5)
                .attr("y", Number(this.getAttribute("cy")) - 15)
                .text(function() {
                    var local_date = y_scale.invert(event_self.getAttribute("cy"));
                    var formatter = d3.time.format.utc("%Y-%m-%d %H:%M:%S (UTC)");
                    return formatter(local_date);
                });
        })
        .mouseout(function(event) {
            this.setAttribute("cursor", null);
            time_indicator.remove();
            time_label.remove();
        });
        circle.on("click", function(event) {
            var target = event.target;
            //console.log(target.id.split("-")); // [timeline, dataset, pid, index=(start_index + index)]
            var data_index = Number(target.id.split("-")[3]) + self.start_index;
            var data = self.dataset[data_index];
            window.popup_pane_collapsed = 0;
            $('.popup-ctrl').css("-webkit-transform", "rotate(180deg)");
            $('.popup-ctrl').css("-moz-transform", "rotate(180deg)");
            $('.popup-ctrl')[0].setAttribute("title", "Collapse event pane");
            $('#event-detail-pane').animate({"bottom": 0}, 500, "ease");
            jQuery(target.nodeName + "#" + target.id).data("opentips")[0].hide();

            var date = data.date * 1000; // convert to milliseconds
            var formatter = d3.time.format.utc("%Y-%m-%d %H:%M:%S");
            var disp_date = formatter(new Date(date));
            $('#date-display').text(disp_date);
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
    }); // each self.dataset

    // draw time brush on control panel
    if (enable_time_brush) {
        $('#time-brush').children().remove(); // remove old brush if any
        // init the time brush on control pane
        var time_brush = d3.select("#time-brush").append("svg")
            .attr("width", 205)
            .attr("height", 50);

        var brush_scale = d3.time.scale()
            .range([0, 205])
            .domain(y_scale.domain());

        var brush_axis = d3.svg.axis()
            .scale(brush_scale)
            .tickSize(30)
            .tickPadding(0)
            .ticks(d3.time.seconds.utc, 5)
            .orient("bottom");

        brush_axis.tickFormat(function(date) {
            formatter = d3.time.format.utc("%S");
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
                y_scale.domain(brush.extent());
                self.clearPath();
                self.timeline.select(".time-axis").call(y_axis);
                self.timeline.selectAll(".grid-line")
                    .attr("y1", y_scale)
                    .attr("y2", y_scale);
                self.timeline.selectAll(".timeline-event")
                    .attr("cy", function(d) { return y_scale(d.date); });
                self.timeline.selectAll(".suspects")
                    .attr("y", function(d) { return y_scale(d.date); });
                self.timeline.selectAll(".description")
                    .attr("y", function(d) { return y_scale(d.date); });
                self.timeline.selectAll("#suspect-description")
                    .attr("y", function(d) { return y_scale(d.date); });
                self.timeline.selectAll("#suspect-time-indicator")
                    .attr("y1", function(d) { return y_scale(d.date); })
                    .attr("y2", function(d) { return y_scale(d.date); });
                self.timeline.selectAll("#suspect-time-label")
                    .attr("y", function(d) { return y_scale(d.date) - 5; });
                //self.fillPathData(x_scale, y_scale, display_dataset);
                //self.drawPath();
                adjustDateLabel();
            }
        }

    } else { // if time brush is disabled, then remove it
        $('#time-brush').children().remove();
    }

} // function onDataReady()

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

Timeline.prototype.getOldestDate = function() {
    var min = this.dataset[0].coords[1];
    this.dataset.forEach(function(data) {
        if (data.coords[1] <= min) {
            min = data.coords[1];
        }
    });
    return Number(min);
}

Timeline.prototype.getLatestDate = function() {
    var max = this.dataset[0].coords[1];
    this.dataset.forEach(function(data) {
        if (data.coords[1] >= max) {
            max = data.coords[1];
        }
    });
    return Number(max);
}

Timeline.prototype.initTickInterval = function() {
    var unit_options = [
        d3.time.seconds.utc,
        d3.time.minutes.utc
    ];
    var step_options = [
        1,
        5,
        15
    ];

    var time_gap = this.y_domain_max - this.y_domain_min;
    var unit_index = time_gap < 1000 ? 0 : 0;
    var step_index = time_gap < 200 ? 0 : (time_gap < 1000 ? 1 : 2);

    this.tick_unit = unit_options[unit_index];
    this.tick_step = step_options[step_index];
}

Timeline.prototype.getMessageNumber = function(data) {
    var message_number = 0;
    for (object in data.content) {
        if (object != 'undifined') {
            message_number += data.content[object].length;
        }
    }
    return message_number;
}

Timeline.prototype.initRadiusDomain = function() {
    // min radius domain: 1
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

