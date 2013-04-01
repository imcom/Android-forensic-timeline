/*
 *
 * Timeline class for generating timeline
 * Author: Imcom
 * Date: 2013-03-06
 *
 */

/*
 * name: div to draw, timeline_height: svg height, x_range: svg width, radius: circle size
 *
 */
function Timeline(name, timeline_height, x_range, radius) {
    // static constant values
    this.name = name;
    this.y_range_padding = 20; // this number can be a constant, padding from the window top
    //this.y_padding = 0.25; // this number can be a constant, since 1 sec is always the interval for Y-axis
    this.x_range = x_range;
    this.timeline_height = timeline_height;

    // dynamically configurable values
    this.dataset = [];
    this.suspects = [];
    //this.radius = radius;
    this.timeline;
    this.y_range;
    //this.x_default = 1;
    //this.x_suspect = 10; //TODO need to verify the offset effect
    //this.x_padding = 1;
    this.tick_padding = 5;
    this.tick_unit;
    this.tick_step;
    this.color_scale;
    this.x_domain_array = [];
    this.x_domain_min = 0;
    this.x_domain_max = 0;
    this.y_domain_min = 0;
    this.y_domain_max = 0;

    /*Disable global name $ from jQuery and reload it into Zepto*/
    jQuery.noConflict();
    $ = Zepto;

    Opentip.styles.tooltip_style = {
        stem: true,
        hideDelay: 0.2,
        delay: 0.3,
        tipJoint: "top right",
        target: true,
        borderWidth: 0
    };

    this.path_data = [];
    this.time_path = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate("monotone");

    /* dragging events handler */
    var self = this;
    this.drag_event = d3.behavior.drag()
        .on('dragstart', function() {
            d3.event.sourceEvent.stopPropagation();
        })
        .on('drag', function(object) {
            var event_id = this.getAttribute('id');
            var data_index = Number(event_id.split('-')[2]);
            var x = Math.max(self.radius, Math.min(self.x_range[1] - self.radius, d3.event.x));
            var y = Math.max(self.radius, Math.min(self.timeline_height - self.radius, d3.event.y))
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
    if (
        this.x_domain_min == 0 &&
        this.x_domain_max == 0
    ) {
        this.x_domain_min = x;
        this.x_domain_max = x;
    } else {
        if (x < this.x_domain_min) {
            this.x_domain_min = x;
        } else if (x > this.x_domain_max) {
            this.x_domain_max = x;
        }
    }
    if (!$.inArray(x, this.x_domain_array))
        this.x_domain_array.push(x);
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

Timeline.prototype.getEvent = function(index) {
    return this.dataset[index];
}

/*
Timeline.prototype.getHeight = function() {
    return this.timeline_height;
}*/

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

Timeline.prototype.initYRange = function() {
    // min: 100, max: 8000; upper bound min: 800
    var data_length = this.dataset.length;
    var upper_range = data_length * 500;
    upper_range = upper_range > 8000 ? 8000 : (upper_range < 800 ? 800 : upper_range);
    return [this.y_range_padding, upper_range];
}

Timeline.prototype.refineXDomainMax = function() {
    var median = d3.median(this.x_domain_array);
    this.x_domain_max = this.x_domain_max > median * 2 ? median + this.x_domain_min : this.x_domain_max;
}

Timeline.prototype.clearData = function() {
    this.dataset = [];
    this.x_domain_min = 0;
    this.x_domain_max = 0;
    this.y_domain_min = 0;
    this.y_domain_max = 0;
}

Timeline.prototype.removeTimeline = function() {
    $(this.getName()).children('.timeline-graph').remove();
}

// fetchData is deprecated since data is fed into Timeline directly
/*
Timeline.prototype.fetchData = function(queries) { // array of query{}: uri, collection, selection, fields, options
    var total = queries.length;
    var excuted = 0;
    var self = this;
    queries.forEach(function(query, index) {
        self.query( // invoke class method `query` for Ajax
            query.uri,
            query.collection,
            query.selection,
            query.fields,
            query.options,
            function(self) { // this self is passed from Ajax callback, which refers to Timeline class instance
                excuted += 1;
                if (excuted == total) {
                    self.onDataReady();
                }
            });
    });
}*/

Timeline.prototype.setDataset = function(data) {
    var self = this;
    var generic_data = new GenericData(data.type, data.content);

    var normal_dataset = {};
    // check and mark abnormal chronologically placed records and store them separately
    // group data by 1st timestamp, 2nd record id, 3rd record object
    var current_date = generic_data.getDate(0); // theoretically the first record should have the minimum date value
    $.each(data.content, function(index) {
        var suspect_data = {};
        if (generic_data.getDate(index) < current_date) { // place abnormal events
            suspect_data.timestamp = generic_data.getDate(index);
            suspect_data._id = generic_data.getId(index);
            var detail = {};
            detail[generic_data.getObject(index)] = [generic_data.getMessage(index)];
            suspect_data.content = [detail];
            self.suspects.push(suspect_data);
        } else { // group normal events by date
            var _id = generic_data.getId(index);
            var object = generic_data.getObject(index);
            var message = generic_data.getMessage(index);
            if (!normal_dataset.hasOwnProperty(current_date)) {
                normal_dataset[current_date] = {};
            }
            var date_group = normal_dataset[current_date];
            if (!date_group.hasOwnProperty(_id)) {
                date_group[_id] = {};
            }
            var id_group = date_group[_id];
            if (!id_group.hasOwnProperty(object)) {
                id_group[object] = [];
            }
            id_group[object].push(message);
            current_date = generic_data.getDate(index);
        }
    });

    // output data sample:
    // data {
    //      timestamp: <timestamp>,
    //      event_id: <id>,
    //      content: {<object> : [messages,...], <object> : [messages,...], ...}
    // }
    for (timestamp in normal_dataset) {
        this.updateYDomain(timestamp); // find out max and min date
        if (timestamp != 'undefined') {
            for (record_id in normal_dataset[timestamp]) {
                if (record_id != 'undefined') {
                    this.updateXDomain(record_id); // form an ID array for X-axis domain
                    this.dataset.push({
                        timestamp: timestamp,
                        _id: record_id,
                        content: normal_dataset[timestamp][record_id]
                    });
                }
            }
        }
    }
    this.refineXDomainMax();

    /*$.each(data.content, function(index) {
        var event_data = {};
        data.content[index].display = "normal";
        if (index == 0) {
            event_data.coords = [x_starts_on, y_starts_on];
        } else {
            if (generic_data.getDate(index) == previous_date) {
                // overlap with next timestamp, then roll back
                if (self.y_padding + y_starts_on >= previous_date + 1) {
                    // set offset on x-axis for distinguish
                    x_starts_on += self.x_padding;
                    y_starts_on = previous_date + overlap_increment;
                    overlap_increment += overlap_increment;
                } else {
                    y_starts_on += self.y_padding;
                }
                event_data.coords = [x_starts_on, y_starts_on];
            // wrong sequence detected
            } else if (generic_data.getDate(index) < previous_date) {
                // using a different offset for distinguish
                event_data.coords = [self.x_suspect, generic_data.getDate(index)];
                //TODO css class, set a different style for suspect events
                data.content[index].display = "suspect";
            } else {
                previous_date = generic_data.getDate(index);
                y_starts_on = previous_date;
                x_starts_on = self.x_default;
                event_data.coords = [self.x_default, y_starts_on];
                overlap_increment = self.y_padding / 2;
            }
        } // if index != 0
        self.updateXDomain(event_data.coords[0]);
        self.updateYDomain(event_data.coords[1]);
        data.content[index].type = data.type;
        event_data.detail = data.content[index];
        self.dataset.push(event_data);
    });*/
    // on dataset is set, draw timeline
    this.onDataReady();
}
// query function is deprecated, data is fed into Timelien from other place
/*
Timeline.prototype.query = function(uri, collection, selection, fields, options, onQueryComplete) {
    var self = this;
    var query_content = {
            collection: collection
    };
    if (options) {
        query_content.options = options;
    }
    if (selection) {
        query_content.selection = selection;
    }
    if (fields) {
        query_content.fields = fields;
    }
    var overlap_increment = self.y_padding / 2;

    $.post(
        uri,
        query_content,
        function(data, status, xhr){
            //init dataset here
            if (data.error != 0) {
                //TODO error handling here
                console.log("server error occured");
            } else { // on query success
                var generic_data = new GenericData(data.type, data.content);
                var y_starts_on = generic_data.getDate(0);
                var x_starts_on = self.x_default;
                var previous_date = y_starts_on;
                $.each(data.content, function(index) {
                    var event_data = {};
                    data.content[index].display = "normal";
                    if (index == 0) {
                        event_data.coords = [x_starts_on, y_starts_on];
                    } else {
                        if (generic_data.getDate(index) == previous_date) {
                            // overlap with next timestamp, then roll back
                            if (self.y_padding + y_starts_on >= previous_date + 1) {
                                // set offset on x-axis for distinguish
                                x_starts_on += self.x_padding;
                                y_starts_on = previous_date + overlap_increment;
                                overlap_increment += overlap_increment;
                            } else {
                                y_starts_on += self.y_padding;
                            }
                            event_data.coords = [x_starts_on, y_starts_on];
                        // wrong sequence detected
                        } else if (generic_data.getDate(index) < previous_date) {
                            // using a different offset for distinguish
                            event_data.coords = [self.x_suspect, generic_data.getDate(index)];
                            //TODO css class, set a different style for suspect events
                            data.content[index].display = "suspect";
                        } else {
                            previous_date = generic_data.getDate(index);
                            y_starts_on = previous_date;
                            x_starts_on = self.x_default;
                            event_data.coords = [self.x_default, y_starts_on];
                            overlap_increment = self.y_padding / 2;
                        }
                    } // if index != 0
                    self.updateXDomain(event_data.coords[0]);
                    self.updateYDomain(event_data.coords[1]);
                    data.content[index].type = data.type;
                    event_data.detail = data.content[index];
                    self.dataset.push(event_data);
                });
                // on query done, callback to caller
                onQueryComplete(self);
            }
        },
        "json" // expected response type
    );
} */

Timeline.prototype.fillPathData = function(x_scale, y_scale, dataset) {
    var self = this;
    self.path_data = []; // clear the old data everytime
    $.each(dataset, function(index) {
        var path_coords = {};
        path_coords['x'] = x_scale(dataset[index].coords[0]);
        path_coords['y'] = y_scale(dataset[index].coords[1]);
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

Timeline.prototype.onDataReady = function() {
    var self = this;
    // calculate the entire time period
    var date_padding = 5; // unit: seconds
    var start_date = new Date((Number(this.y_domain_min) - date_padding) * 1000);
    var end_date = new Date((Number(this.y_domain_max) + date_padding) * 1000);

    // convert epoch timestamp to date for d3 time scale and init display dataset
    var display_dataset = [];
    this.dataset.forEach(function(data) {
        var display_data = {};
        var date = new Date(data.timestamp * 1000); // convert to milliseconds
        display_data.date = date;
        display_data._id = Number(data._id);
        display_data.content = data.content;
        display_dataset.push(display_data);
    });

    // debugging info
    console.log(start_date);
    console.log(end_date);
    console.log(display_dataset.length);

    this.color_scale = d3.scale.category10();
    this.initTickInterval(); // init tick unit (seconds, minutes, etc.) and step (5, 15, 30 ...)
    this.y_range = this.initYRange();

    var x_scale = d3.scale.linear()
                 .domain([
                            this.x_domain_min,
                            this.x_domain_max
                        ])
                 .range(this.x_range)
                 .clamp(true);

    var y_scale = d3.time.scale.utc()
                 .domain([
                            start_date,
                            end_date
                        ])
                 .range(this.y_range);

    // draw Y axis on timeline
    var y_axis = d3.svg.axis()
        .scale(y_scale)
        .orient("right")
        .ticks(this.tick_unit, this.tick_step) // make it a variable
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
        .data(y_scale.ticks(this.tick_unit, this.tick_step))
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
    var scale_extent = [1, 20]; // used for zoom function
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
            $('.reset-scale').css('opacity', 0.8).css('z-index', 100);
        } else {
            $('.reset-scale').css('opacity', 0).css('z-index', -1);
        }
        self.clearPath();
        self.timeline.select(".time-axis").call(y_axis);
        self.timeline.selectAll(".grid-line")
            .attr("y1", y_scale)
            .attr("y2", y_scale);
        self.timeline.selectAll(".timeline-event")
            .attr("cy", function(d) { return y_scale(d.coords[1]); });
        self.timeline.selectAll(".description")
            .attr("y", function(d) { return y_scale(d.coords[1]); });
        self.fillPathData(x_scale, y_scale, display_dataset);
        self.drawPath();
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
    //FIXME
    return;
    function x(d) {

    }

    function y(d) {

    }

    function color(d) {

    }

    function radius(d) {

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
        //TODO change functions below for new data stracture
        .attr("id", function(data, index){
            var generic_data = new GenericData(data.detail.type, data.detail);
            return self.name.substr(1) + "-" + generic_data.getId() + "-" + index;
        })
        .attr("cx", function(data) {
            return x_scale(data.coords[0]);
        })
        .attr("cy", function(data) {
            return y_scale(data.coords[1]);
        })
        .attr("r", this.radius)
        .call(this.drag_event);

    this.fillPathData(x_scale, y_scale, display_dataset);
    this.drawPath();

    this.timeline.selectAll("text[id=" + this.name.substr(1) + "]")
        .data(display_dataset)
        .enter()
        .append("text")
        .attr("class", function(data){
            return "description" + " " + data.detail.display;
        })
        .attr("id", this.name.substr(1))
        .text(function(data) {
            var generic_data = new GenericData(data.detail.type, data.detail);
            return generic_data.getDisplayName();
        })
        .attr("fill", function(d) {
            //TODO modify the function below for new data structure
            var generic_data = new GenericData(d.detail.type, d.detail);
            return self.color_scale(Number(generic_data.getId()));
        });

    var text_fields = $("text[id=" + this.name.substr(1) + "]");
    $.each(display_dataset, function(index) {
        text_fields[index].setAttribute("x", x_scale(display_dataset[index].coords[0]) + 5);
        text_fields[index].setAttribute("y", y_scale(display_dataset[index].coords[1]));
        var generic_data = new GenericData(
            display_dataset[index].detail.type,
            display_dataset[index].detail
        );
        text_fields[index].setAttribute("id", self.name.substr(1) + "-" + generic_data.getId() + "-" + index);

        var text_field = jQuery('text[id=' + self.name.substr(1) + "-" + generic_data.getId() + "-" + index + "]");

        text_field.opentip(generic_data.getMessage(), {style: "tooltip_style"});

        text_field.mouseover(function(event){ /*overwrite the default self object -- [mouse event]*/
            this.setAttribute("cursor", "pointer");
        })
        .mouseout(function(event) {
            this.setAttribute("cursor", null);
        });

        text_field.on("click", function(event) {
            var target = event.target;
            console.log(target.id.split("-"));
            jQuery(target.nodeName + "#" + target.id).data("opentips")[0].hide();
        });

        var time_indicator;
        var time_label;
        var circle = $('circle[id=' + self.name.substr(1) + "-" + generic_data.getId() + "-" + index + "]");
        circle.mouseover(function(event) {
            var event_self = this;
            this.setAttribute("fill", "grey");
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
            this.setAttribute("fill", "black");
            this.setAttribute("cursor", null);
            time_indicator.remove();
            time_label.remove();
        });
    }); // each self.dataset

} // function onDataReady()

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
        5,
        15
    ];

    var unit_index = this.dataset.length < 100 ? 0 : 0;
    var step_index = this.dataset.length < 222 ? 0 : 1;

    this.tick_unit = unit_options[unit_index];
    this.tick_step = step_options[step_index];
}

Timeline.prototype.initRadiusDomain = function() {
    // min radius domain: 1
    var max_domain = 0, max_message_number = 0, msg_number_array = [], median = 0;
    this.dataset.forEach(function(data) {
        if (data.messages.length >= max_message_number) {
            max_message_number = data.messages.length;
        }
        msg_number_array.push(data.messages.length);
    });
    median = d3.median(msg_number_array);
    max_domain = max_message_number > median * 2 ? Math.sqrt(max_message_number) : max_message_number;
    return [1, max_domain];
}

