

// name selects the div for bearing svg
function DeltaTimeGraph(name, dataset) {
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
            object_coords.name = JSON.stringify({sig: bar.values[index].signature});
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

    function initDeltaDomain() {
        self.dataset.forEach(function(data) {
            data.delta_time = Number(data.delta_time);
        });
        return [self.dataset[0].delta_time, self.dataset[self.dataset.length - 1].delta_time];
    }

    //var time_domain = initDateDomain();
    var delta_domain = initDeltaDomain();
    //var time_diff = (Number(this.dataset[this.dataset.length - 1].date) - Number(this.dataset[0].date)) / 1000;
    var time_diff = (this.dataset[this.dataset.length - 1].delta_time - this.dataset[0].delta_time);
    var max_range = time_diff <= 1000 ? width : time_diff >= 20000 ? time_diff * 2 : time_diff;
    //var x_scale = d3.time.scale.utc().domain(time_domain).range([0, max_range]);
    var x_scale = d3.scale.linear()
        .domain(delta_domain)
        .range([80, width - 80]);

    var y_scale = d3.scale.linear()
        .domain([0, y_domain_max])
        .range([height - 50, y_padding]); // range should depend on y_domain_max

    var color_scale = d3.scale.category10();

    var x_axis = d3.svg.axis()
        .orient("top")
        .scale(x_scale)
        .tickPadding(tick_padding)
        .tickSize(0);

    /*x_axis.tickFormat(function(date) {

    });*/

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
    var scale_extent = [-5, 5];
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
        /*if (d3.event.scale > 6) {
            initTickInterval([0, 0]);
            x_axis.ticks(tick_unit, tick_step);
        } else {
            initTickInterval(null);
            x_axis.ticks(tick_unit, tick_step);
        }*/
        stacked_graph.select(".stack-axis").call(x_axis);
        stacked_graph.selectAll(".stack-layer")
            .attr("transform", function(d) { return "translate(" + (x_scale(d.delta_time) - 15) + ",0)"; });
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
        .attr("transform", function(d) { return "translate(" + (x_scale(d.delta_time) - 15) + ",0)"; });

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
        content.forEach(function(_content) {
            message += _content[0];
            message += ":{</br>";
            message += "&nbsp&nbsp" + _content[1]; // msg
            message += "&nbsp[" + _content[2] + "]"; // pid
            message += "</br>}</br>";
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
        .text(function(d) {
            var sig = JSON.parse(d);
            var title = "";
            sig.sig.forEach(function(_sig) {
                title += _sig[0]; // only use system call name
                title += "-";
            });
            return title.substr(0, title.length - 1); // remove tailing `-`
        });

    // draw time brush on control panel (should move this function to stacked graph)
    $('#time-brush-extend').children().remove(); // remove old brush if any
    // init the time brush on extra control pane
    var time_brush = d3.select("#time-brush-extend").append("svg")
        .attr("width", width)
        .attr("height", 60); // FIXME height is to be defined

    var brush_scale = d3.scale.linear()
        .range([60, width]) //FIXME padding is to be defined
        .domain(x_scale.domain());

    var brush_axis = d3.svg.axis()
        .scale(brush_scale)
        .tickSize(30)
        .tickPadding(0)
        //.ticks(d3.time.minutes.utc, 15)
        //.ticks(tick_unit, tick_step)
        .ticks(20)
        .orient("bottom");

    /*brush_axis.tickFormat(function(date) {
        var seconds = Number(date) / 1000 - anchor_time;
        var delta_time = Math.round(seconds / 3600) + 'h ' +
                        Math.round(seconds % 3600 / 60) + 'm ' +
                        seconds % 3600 % 60 + 's';
        return delta_time;
    });*/

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
                .attr("transform", function(d) { return "translate(" + (x_scale(d.delta_time) - 15) + ",0)"; });
        }
    }

}




















