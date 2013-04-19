

// name selects the div for bearing svg
function StackedGraph(name, dataset) {
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
            object_coords.y = (y0 += +bar.values[index].count);
            return object_coords;
        });
        bar.max_number = bar.objects[bar.objects.length - 1].y;
    });

    // stack graph config
    var stack = d3.layout.stack();
    var y_domain_max = d3.max(this.dataset, function(data) {
        return data.max_number;
    });
    var x_domain = initXDomain();

    function initXDomain() {
        var delta_times = [];
        self.dataset.forEach(function(data) {
            if (delta_times.indexOf(Number(data.delta_time)) === -1)
                delta_times.push(Number(data.delta_time));
        });
        return delta_times;
    }

    var x_scale = d3.scale.ordinal()
        .domain(x_domain)
        .rangePoints([0, 25000], 1.0); //FIXME range should depend on size of x_domain

    var y_scale = d3.scale.linear()
        .domain([1, y_domain_max])
        .range([height - 75, y_padding]);

    var color_scale = d3.scale.category10();

    // define x axis
    var x_axis = d3.svg.axis()
        .orient("top")
        .scale(x_scale)
        .tickPadding(tick_padding)
        .tickSize(-5);

    x_axis.tickFormat(function(seconds) {
        return seconds + "s"; //TODO convert the seconds in to more friendly expression
    });

    // TBD y axis (number of events)

    // create svg for aggregated graph
    var stacked_graph = d3.select(this.name)
        .append("svg")
        .attr("class", "stacked-graph")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(20, 20)");

    stacked_graph.append('g')
        .attr("class", "stack-axis")
        .attr("transform", "translate(0, " + (height - y_padding / 2) + ")")
        .call(x_axis);

    // draw layers and rects on svg
    var layer = stacked_graph.selectAll(".layer")
        .data(this.dataset)
        .enter()
        .append('g')
        .attr('class', 'stack-layer')
        .attr("transform", function(d) { return "translate(" + (x_scale(d.delta_time) - 15) + ",0)"; });

    var rect = layer.selectAll("rect")
        .data(function(d) {
            return d.objects;
        })
        .enter()
        .append("rect")
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

}




















