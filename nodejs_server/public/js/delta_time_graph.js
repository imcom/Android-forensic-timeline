

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
    var height = 820;
    var y_padding = 100;
    var tick_padding = -15;

    // init dataset for stack graph
    this.dataset.forEach(function(bar) {
        var y0 = 0; // baseline is zero
        // for each value in bar --> objects : [obj_coords, ...]
        bar.objects = d3.range(bar.values.length).map(function(index) {
            var object_coords = {};
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
    var delta_domain = initDeltaDomain();
    var x_scale = d3.scale.linear()
        .domain(delta_domain)
        .range([50, width - 50]); //TODO this may break when the delta time is large

    // init Y axis scale
    var y_scale = d3.scale.linear()
        .domain([0, y_domain_max])
        .range([height - y_padding / 2, y_padding]); // range starts from X axis

    var color_scale = d3.scale.category20();

    var x_axis = d3.svg.axis()
        .orient("top")
        .scale(x_scale)
        .tickPadding(tick_padding)
        .tickSize(0);

    x_axis.tickFormat(function(date) {
        return date + "s";
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

    var delta_time_label;
    var layers = $('.stack-layer');
    layers.forEach(function(_layer, l_index) {
        $.each(_layer.childNodes, function(e_index) {
            jQuery(_layer.childNodes[e_index]).opentip(
                formatMessages(self.dataset[l_index].content[e_index]),
                {style: "tooltip_style"}
            );
            $(_layer.childNodes[e_index]).mouseover(function(mouse_event) {
                //FIXME show delta time label on mouseover
                console.log("delta time: " + self.dataset[l_index].delta_time);
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
    }

    // append legend to the graph (too many to show properly)
    /*var legend = stacked_graph.selectAll(".legend")
        .data(color_scale.domain().slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 14 + ")"; });

    legend.append("rect")
        .attr("x", 10)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", color_scale);

    legend.append("text")
        .attr("x", 30)
        .attr("y", 5)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) {
            var sig = JSON.parse(d);
            var title = "";
            // only use system call name
            sig.sig.forEach(function(_sig) {
                title += _sig[0];
                title += "-";
            });
            title = title.substr(0, title.length - 1); // trim the tailing `-`
            return title;
        });*/
}













