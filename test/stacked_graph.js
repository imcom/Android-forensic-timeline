

//FIXME to be deprecated
function StackedGraph(name, dataset, anchor_time) {
    /*Disable global name $ from jQuery and reload it into Zepto*/
    jQuery.noConflict();
    $ = Zepto;
    var self = this;

    //OpenTip config
    Opentip.styles.tooltip_style = {
        stem: true,
        hideDelay: 0.2,
        delay: 0.3,
        tipJoint: "bottom right",
        target: true,
        borderWidth: 0
    };

    // class variable
    this.name = name;
    this.dataset = dataset;

    // dimensions
    var width = 1800;
    var height = 620;
    var y_padding = 100;
    var tick_padding = -20;

    // init dataset for stack graph
    this.dataset.forEach(function(bar) {
        var y0 = 0; // baseline is zero
        bar.objects = d3.range(bar.values.length).map(function(index) {
            var object_coords = {};
            object_coords.name = bar.values[index].object;
            object_coords.y0 = y0;
            object_coords.y = (y0 += bar.values[index].count);
            return object_coords;
        });
        bar.max_number = bar.objects[bar.objects.length - 1].y;
    });

    // stack graph config
    var stack = d3.layout.stack();
    var y_domain_max = d3.max(this.dataset, function(data) {
        return data.max_number;
    });

    function initDateDomain() {
        self.dataset.forEach(function(data) {
            var date = new Date((Number(data.delta_time) + Number(anchor_time)) * 1000);
            data.date = date;
        });
        return [self.dataset[0].date, self.dataset[self.dataset.length - 1].date];
    }

    var time_domain = initDateDomain();
    var time_diff = (Number(this.dataset[this.dataset.length - 1].date) - Number(this.dataset[0].date)) / 1000;
    var max_range = time_diff <= 1000 ? width : time_diff >= 20000 ? time_diff * 2 : time_diff;
    var x_scale = d3.time.scale.utc().domain(time_domain).range([0, max_range]);

    var y_scale = d3.scale.linear()
        .domain([1, y_domain_max])
        .range([height - 75, y_padding]);

    var color_scale = d3.scale.category10();

    // define x axis
    var tick_unit;
    var tick_step;

    // tick_index: {null} use calculated tick step; [{0, 1, 2, 3}, {0, 1, 2}] specify an unit and step
    function initTickInterval(tick_index) {
        var start_date = self.dataset[0].date;
        var end_date = self.dataset[self.dataset.length - 1].date;

        var unit_options = [
            d3.time.seconds.utc,
            d3.time.minutes.utc,
            d3.time.hours.utc,
            d3.time.days.uts
        ];
        var step_options = [
            5,
            15,
            30
        ];

        if (tick_index === null) {
            var unit_index = end_date - start_date <= 1000 ? 0 : 1;
            var step_index = end_date - start_date <= 3600 ? 0 : 0;
        } else {
            var unit_index = tick_index[0];
            var step_index = tick_index[1];
        }

        tick_unit = unit_options[unit_index];
        tick_step = step_options[step_index];
    }

    initTickInterval(null); // do NOT set tick_step here

    var x_axis = d3.svg.axis()
        .orient("top")
        .scale(x_scale)
        .ticks(tick_unit, tick_step) // make it a variable
        .tickPadding(tick_padding)
        .tickSize(-5);

    x_axis.tickFormat(function(date) {
        var seconds = Number(date) / 1000 - anchor_time;
        var delta_time = Math.round(seconds / 3600) + 'h ' +
                        Math.round(seconds % 3600 / 60) + 'm ' +
                        seconds % 3600 % 60 + 's';
        return delta_time;
    });

    // create svg for aggregated graph
    var stacked_graph = d3.select(this.name)
        .append("svg")
        .attr("class", "stacked-graph")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(20, 20)");

    // graph title, explaination of the graph
    stacked_graph.append("text")
        .attr("class", "stack-graph-title")
        .attr("x", (width / 2) - 250)
        .attr("y", 0)
        .text("The Length of Rect Is Proportional To The Number Of Events");

    // append an overflow clip path
    stacked_graph.append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height);

    // X axis
    stacked_graph.append('g')
        .attr("class", "stack-axis")
        .attr("transform", "translate(0, " + (height - y_padding / 2) + ")")
        .call(x_axis);

    // append clipping components
    var scale_extent = [1, 12];
    stacked_graph.append("svg:rect")
        .attr("class", "ctrl-pane")
        .attr("width", width)
        .attr("height", y_padding)
        .call(d3.behavior.zoom()
                .x(x_scale)
                .scaleExtent(scale_extent)
                .on("zoom", zoom)
        );

    function zoom() {
        if (d3.event.scale > 6) {
            initTickInterval([0, 0]);
            x_axis.ticks(tick_unit, tick_step);
        } else {
            initTickInterval(null);
            x_axis.ticks(tick_unit, tick_step);
        }
        stacked_graph.select(".stack-axis").call(x_axis);
        stacked_graph.selectAll(".stack-layer")
            .attr("transform", function(d) { return "translate(" + (x_scale(d.date) - 15) + ",0)"; });
    }

    // draw layers and rects on svg
    var layer = stacked_graph.selectAll(".stack-layer")
        .data(this.dataset)
        .enter()
        .append('g')
        .attr('class', 'stack-layer')
        .attr('id', function(d, index) {
            return "stack-" + index;
        })
        .attr("transform", function(d) { return "translate(" + (x_scale(d.date) - 15) + ",0)"; });

    var rect = layer.selectAll("rect.rect-layer")
        .data(function(d) {
            return d.objects;
        })
        .enter()
        .append("rect")
        .attr("class", "rect-layer")
        .attr("id", function(d, index) {
            return "event-" + index;
        })
        .attr("y", function(d) {
            return y_scale(d.y);
        })
        .attr("width", 30)
        .attr("height", function(d) {
            return y_scale(d.y0) - y_scale(d.y);
        })
        .style("fill", function(d) {
            return color_scale(d.name);
        });

    var layers = $('.stack-layer');
    layers.forEach(function(_layer, l_index) {
        $.each(_layer.childNodes, function(e_index) {
            jQuery(_layer.childNodes[e_index]).opentip(
                formatMessages(self.dataset[l_index].content[e_index]),
                {style: "tooltip_style"}
            );
            $(_layer.childNodes[e_index]).mouseover(function(mouse_event) {
                this.setAttribute("cursor", "pointer");
            })
            .mouseout(function(mouse_event) {
                this.setAttribute("cursor", "pointer");
            });
        });
    });

    function formatMessages(content) {
        var message = "";
        content.pids.forEach(function(pid, index) {
            message += pid;
            message += ":";
            message += content.messages[index];
            message += "</br>";
        });
        return message;
    }

    // append legend to the graph
    var legend = stacked_graph.selectAll(".legend")
        .data(color_scale.domain().slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", 10)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color_scale);

    legend.append("text")
        .attr("x", 30)
        .attr("y", 10)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) { return d; });

    // draw time brush on control panel (should move this function to stacked graph)
    $('#time-brush').children().remove(); // remove old brush if any
    // init the time brush on extra control pane
    var time_brush = d3.select("#time-brush").append("svg")
        .attr("width", width)
        .attr("height", 60);

    var brush_scale = d3.time.scale()
        .range([0, width])
        .domain(x_scale.domain());

    var brush_axis = d3.svg.axis()
        .scale(brush_scale)
        .tickSize(30)
        .tickPadding(0)
        .ticks(d3.time.minutes.utc, 15)
        //.ticks(tick_unit, tick_step)
        .orient("bottom");

    brush_axis.tickFormat(function(date) {
        var seconds = Number(date) / 1000 - anchor_time;
        var delta_time = Math.round(seconds / 3600) + 'h ' +
                        Math.round(seconds % 3600 / 60) + 'm ' +
                        seconds % 3600 % 60 + 's';
        return delta_time;
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
            stacked_graph.select(".stack-axis").call(x_axis);
            stacked_graph.selectAll(".stack-layer")
                .attr("transform", function(d) { return "translate(" + (x_scale(d.date) - 15) + ",0)"; });
        }
    }

}




















