

// name selects the div for bearing svg
function SOMGraph(name, nodes, app_traces) {
    /*Disable global name $ from jQuery and reload it into Zepto*/
    jQuery.noConflict();
    $ = Zepto;
    var self = this;

    console.log(app_traces);

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
    this.nodes = nodes;
    this.dataset = dataset;

    // dimensions
    var width = 1800;
    var height = 820;

    // init dataset for stack graph
    /*this.dataset.forEach(function(bar) {
        var y0 = 0; // baseline is zero
        // for each value in bar --> objects : [obj_coords, ...]
        bar.objects = d3.range(bar.values.length).map(function(index) {
            var object_coords = {};
            // use signature JSON string to select color
            object_coords.name = JSON.stringify(bar.values[index].signature);
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

    // init X axis scale
    //var delta_domain = initDeltaDomain();*/

    var som_width = 5; //FIXME read from config file
    var som_height = 3; //FIXME read from config file
    var extent = 20;

    // define SOM axes domain
    var x_domain = [];
    for (var i = 0; i < som_width; ++i) {
        x_domain.push(i * extent);
    }
    var y_domain = [];
    for (var i = 0; i < som_height; ++i) {
        y_domain.push(i * extent);
    }

    // init X axis scale
    var x_scale = d3.scale.ordinal()
        .domain(x_domain)
        .rangePoints([150, width], 1.5);
        //.range([x_padding * 3, width - x_padding]);

    // init Y axis scale
    var y_scale = d3.scale.ordinal()
        .domain(y_domain)
        .rangePoints([height, 0], 1.5);
        //.range([height - y_padding * 3, y_padding]);

    // color scale for different apps
    var color_scale = d3.scale.category20();

    // define radius function
    var radius = function(d) { return d.count; }

    // define X axis function
    var x = function(d) { return d.x * extent; }

    // define Y axis function
    var y = function(d) { return d.y * extent; }

    var max_count = 0;
    for (var index in nodes) {
        if (index === undefined) continue;
        if (nodes[index].count > max_count) max_count = nodes[index].count;
    }
    // define radius range
    var radius_range = [5, Math.round(height / som_width)];
    var radius_scale = d3.scale.sqrt()
        .domain([1, max_count])
        .range(radius_range)
        .clamp(true);

    /*var x_axis = d3.svg.axis()
        .orient("top")
        .scale(x_scale)
        .tickPadding(tick_padding)
        .tickSize(0);

    x_axis.tickFormat(function(date) {
        return date + "s";
    });*/

    // create svg for aggregated graph
    var som_graph = d3.select(this.name)
        .append("svg")
        .attr("class", "som-graph")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(0, 20)");

    /* draw grid lines on the graph */
    var grid = som_graph.selectAll("line.grid-line")
        .data(x_domain)
        .enter()
        .append("g")
        .attr("class", "grid-som");
    // vertical lines
    grid.append("line")
        .attr("class", "grid-line")
        .attr("y1", 0)
        .attr("y2", height)
        .attr("x1", x_scale)
        .attr("x2", x_scale);
    // horizontal lines
    grid.append("line")
        .attr("class", "grid-line")
        .attr("y1", y_scale)
        .attr("y2", y_scale)
        .attr("x1", 0)
        .attr("x2", width);

    // draw clusters on graph
    var som_nodes = som_graph.append("g")
        .attr("id", "som-nodes")
        .selectAll(".node")
        .data(nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("id", function(d, index) { return "node-" + index })
        .style("fill", 'none')
        .style('stroke', 'black')
        .attr("cx", function(d) { return x_scale(x(d)); })
        .attr("cy", function(d) { return y_scale(y(d)); })
        .attr("r", function(d) { return radius_scale(radius(d)); })
        .sort(function(x, y) {return radius(y) - radius(x)});

    // draw apps in each node on graph
    var offset_range = _.range(-radius_range[1] + extent, radius_range[1] - extent, 8);
    for (var index in nodes) {
        offset_range = _.shuffle(offset_range); // shuffle the offset range every time
        som_graph.append("g")
            .selectAll(".node-app-" + index)
            .data(nodes[index].extra_data.apps)
            .enter().append("circle")
            .attr("class", "node-app-" + index)
            .style("fill", function(d) {
                return color_scale(d);
            })
            .attr("cx", function(d, i) {
                return x_scale(nodes[index].x * extent) + offset_range[i];
            })
            .attr("cy", function(d, i) {
                var y_offset = (i * i) % offset_range.length;
                return y_scale(nodes[index].y * extent) + offset_range[y_offset];
            })
            .attr("r", 5);
    }

    // append legend to the graph (too many to show properly)
    var legend = som_graph.selectAll(".legend")
        .data(color_scale.domain().slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 14 + ")"; });

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 8)
        .attr("height", 8)
        .style("fill", color_scale);

    legend.append("text")
        .attr("x", 10)
        .attr("y", 5)
        .attr("dy", ".25em")
        .style("text-anchor", "start")
        .text(function(d) {
            return d.substr(4); // remove `com.` to save space
        });

    // graph title, explaination of the graph
    /*stacked_graph.append("text")
        .attr("class", "stack-graph-title")
        .attr("x", (width / 2) - 250)
        .attr("y", 0)
        .text("The Length of Rect Is Proportional To The Number Of Events");*/

    // append an overflow clip path
    /*stacked_graph.append("svg:clipPath")
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
        stacked_graph.select(".stack-axis").call(x_axis);
        stacked_graph.selectAll(".stack-layer")
            .attr("transform", function(d) { return "translate(" + (x_scale(d.delta_time) - 15) + ",0)"; });
    }*/

    // draw layers and rects on svg
    /*var layer = stacked_graph.selectAll(".stack-layer")
        .data(this.dataset)
        .enter()
        .append('g')
        .attr('class', 'stack-layer')
        .attr('id', function(d, index) {
            return "stack-" + index;
        })
        .attr("transform", function(d) { return "translate(" + (x_scale(d.delta_time) - 15) + ",0)"; });

    // draw rects on each layer
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

    var delta_time_label;
    var layers = $('.stack-layer');
    layers.forEach(function(_layer, l_index) {
        $.each(_layer.childNodes, function(e_index) {
            jQuery(_layer.childNodes[e_index]).opentip(
                formatMessages(self.dataset[l_index].content[e_index]),
                {style: "tooltip_style"}
            );
            $(_layer.childNodes[e_index]).mouseover(function(mouse_event) {
                delta_time_label = stacked_graph.append("text")
                    .attr("class", "time-label")
                    .attr("x", x_scale(self.dataset[l_index].delta_time) - 30)
                    .attr("y", height - 20)
                    .text(function() {
                        var delta = self.dataset[l_index].delta_time;
                        var hours = Math.round(delta / (60 * 60));
                        delta = delta % (60 * 60);
                        var minutes = Math.round(delta / 60);
                        var seconds = delta % 60;
                        return hours + "h " + minutes + "m " + seconds + "s";
                    });
                this.setAttribute("cursor", "pointer");
            })
            .mouseout(function(mouse_event) {
                this.setAttribute("cursor", "pointer");
                delta_time_label.remove();
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
    }*/

}




