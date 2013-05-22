
// name indicates the div for bearing svg
function AggregatedGraph(name, dataset) {
    /*Disable global name $ from jQuery and reload it into Zepto*/
    jQuery.noConflict();
    $ = Zepto;

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
    this.aggregation_type = dataset.type;
    if (this.aggregation_type === 'object') {
        this.object = dataset.object; // aggregated by this object
    } else {
        this._id = dataset._id; // aggregated by this id
    }
    this.dataset = this.initDataset(dataset);
    //this.y_domain_map = {};
    this.x_domain_min;
    this.x_domain_max;
    this.y_domain_array = [];
    this.initXDomain();
    this.initYDomain();
    var self = this;

    // generic visualisation functions
    this.radius = function(d) { return d.messages.length; }
    this.x = function(d) { return d.date; }

    // dimensions
    var y_padding = 100;
    var tick_padding = -15;
    var radius_range = [10, 60];
    var scale_extent = [-5, 10]; // used for zoom function
    var height_margin = 150;
    var width_margin = 100;
    //this.width = 1800;
    //this.height = 820;
    this.width = window.innerWidth - width_margin;
    this.height = window.innerHeight - height_margin;
    this.x_range = this.initXRange(); // x range should be dependent on dataset size
    this.y_range = [this.height - 150, y_padding];
    this.tick_unit;
    this.tick_step;

    // set boundaries of the timeline
    var date_padding = 60 * 5; // set 5 minutes padding on graph beginning
    var start_date = new Date((this.getOldestDate() - date_padding) * 1000);
    var end_date = new Date(this.getLatestDate() * 1000);

    // graph scales
    this.x_scale = d3.time.scale.utc().domain([start_date, end_date]).range(this.x_range);
    this.y_scale = d3.scale.ordinal()
        .domain(this.y_domain_array)
        .rangePoints(this.y_range, 1.5);

    this.radius_scale = d3.scale.pow()
        .exponent(2)
        .domain(this.initRadiusDomain())
        .range(radius_range)
        .clamp(true);

    // init color scale
    this.color_scale = d3.scale.category20();

    //FIXME this is to be refined (fixed return at present)
    this.initTickInterval();

    // convert epoch timestamp to date for d3 time scale
    this.dataset.forEach(function(record) {
        var date = new Date(record.date * 1000); // convert to milliseconds
        record.date = date;
    });

    // define x axis
    this.x_axis = d3.svg.axis()
        .orient("top")
        .scale(this.x_scale)
        .ticks(this.tick_unit, this.tick_step) // make it a variable
        .tickPadding(tick_padding)
        .tickSize(0);

    this.x_axis.tickFormat(function(date) {
        var formatter = d3.time.format.utc("%m-%d %H:%M");
        return formatter(date);
    });

    // create svg for aggregated graph
    this.aggregated_graph = d3.select(this.name)
        .append("svg")
        .attr("class", "aggregated-graph")
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g")
        .attr("transform", "translate(0, 20)");

    // graph title, which object or pid is aggregated
    this.aggregated_graph.append("text")
        .attr("class", "graph-title")
        .attr("x", this.width - Math.round(this.width / 3))
        .attr("y", 0)
        .text(function(){
            if (self.aggregation_type === 'object') {
                return self.object;
            } else {
                return self._id;
            }
        });

    // append an overflow clip path
    this.aggregated_graph.append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", this.width)
        .attr("height", this.height - y_padding);

    // draw x axis
    this.aggregated_graph.append('g')
        .attr("class", "aggregation-axis")
        .attr("transform", "translate(0, " + (this.height - y_padding) + ")")
        .call(this.x_axis);

    /* draw grid lines on the graph */
    this.grid = this.aggregated_graph.selectAll("line.grid")
        .data(this.x_scale.ticks(this.tick_unit, this.tick_step)) //TODO define interval
        .enter()
        .append("g")
        .attr("clip-path", "url(#clip)")
        .attr("class", "grid-aggr");

    this.grid.append("line")
        .attr("y1", 0)
        .attr("class", "grid-line")
        .attr("y2", this.height - y_padding)
        .attr("x1", this.x_scale)
        .attr("x2", this.x_scale);

    // append clipping components
    this.aggregated_graph.append("svg:rect")
        .attr("class", "ctrl-pane")
        .attr("width", this.width)
        .attr("height", y_padding)
        .call(d3.behavior.zoom()
                .x(this.x_scale)
                .scaleExtent(scale_extent)
                .on("zoom", zoom)
        );

    function zoom() {
        self.aggregated_graph.select(".aggregation-axis").call(self.x_axis);
        self.aggregated_graph.selectAll(".grid-line")
            .attr("x1", self.x_scale)
            .attr("x2", self.x_scale);
        self.aggregated_graph.selectAll(".cluster")
            .attr("cx", function(d) { return self.x_scale(self.x(d)); });
    }

    // draw events on the graph
    this.drawAggregatedGraph();
} // class construction function

AggregatedGraph.prototype.formatMessages = function(messages) {
    var formatted_msg = "";
    messages.forEach(function(msg, index) {
        if (msg === "\r" || msg === "") {
            msg = "empty message";
        }
        formatted_msg += (index + ":" + msg);
        formatted_msg += "</br>";
    });
    return formatted_msg;
}

AggregatedGraph.prototype.drawAggregatedGraph = function() {
    var self = this;
    // Y axis generator
    var y = function(d) {
        if (self.aggregation_type === 'object') {
            return d._id;
        } else {
            //return self.y_domain_map[d.object];
            return d.object;
        }
    }
    // Color generator
    var color = function(d) {
        if (self.aggregation_type === 'object') {
            return d._id;
        } else {
            return d.object;
        }
    }

    // used for mouseover display
    var time_indicator;
    var time_label;

    this.clusters = this.aggregated_graph.append("g")
        .attr("id", "clusters")
        .attr("clip-path", "url(#clip)")
        .selectAll(".cluster")
        .data(this.dataset)
        .enter().append("circle")
        .attr("class", "cluster")
        .attr("id", function(d, index) { return "event-" + index })
        .style("fill", function(d) { return self.color_scale(color(d)); })
        .attr("cx", function(d) { return self.x_scale(self.x(d)); })
        .attr("cy", function(d) { return self.y_scale(y(d)); })
        .attr("r", function(d) { return self.radius_scale(self.radius(d)); })
        .sort(function(x, y) {return self.radius(y) - self.radius(x)});

    var circles = $('circle.cluster');
    circles.mouseover(function(event) {
        var event_self = this;
        this.setAttribute("cursor", "pointer");
        time_indicator = self.aggregated_graph.append("line")
            .attr("class", "time-indicator")
            .attr("y1", 0)
            .attr("y2", self.height - 50)
            .attr("x1", this.getAttribute("cx"))
            .attr("x2", this.getAttribute("cx"));

        time_label = self.aggregated_graph.append("text")
            .attr("class", "time-label")
            .attr("x", Number(this.getAttribute("cx")) + 10)
            .attr("y", 20)
            .text(function() {
                var local_date = self.x_scale.invert(event_self.getAttribute("cx"));
                var formatter = d3.time.format.utc("%Y-%m-%d %H:%M:%S (UTC)");
                return formatter(local_date);
            });
    })
    .mouseout(function(event){
        this.setAttribute("cursor", null);
        time_indicator.remove();
        time_label.remove();
    });

    circles.forEach(function(circle) {
        var index = Number(circle.id.split('-')[1]);
        jQuery(circle).opentip(
            self.formatMessages(self.dataset[index].messages),
            {style: "tooltip_style"}
        );
    });

    var text_padding = 30;
    var legend = this.aggregated_graph.selectAll(".legend")
        .data(this.color_scale.domain().slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", 10)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", this.color_scale);

    legend.append("text")
        .attr("x", text_padding)
        .attr("y", 10)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) { return d; });

    // append a time brush below the graph
    var brush_scale = d3.time.scale()
        .range([10, this.width - 50])
        .domain(self.x_scale.domain());

    var brush_axis = d3.svg.axis()
        .scale(brush_scale)
        .tickSize(30)
        .tickPadding(5)
        .ticks(d3.time.minutes.utc, 30) //FIXME can be implemented in the same way as Timeline
        .orient("bottom");

    brush_axis.tickFormat(function(date) {
        var formatter = d3.time.format.utc("%m-%d %H:%M");
        return formatter(date);
    });

    var brush = d3.svg.brush()
        .x(brush_scale)
        .on("brush", onBrush);

    this.aggregated_graph.append("g")
        .attr("class", "time-brush-axis")
        .attr("transform", "translate(0, " + (this.height - 75) + ")")
        .call(brush_axis);

    this.aggregated_graph.append("g")
        .attr("class", "time-brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", this.height - 75)
        .attr("height", 30);

    function onBrush() {
        if (!brush.empty()) {
            self.x_scale.domain(brush.extent());
            self.aggregated_graph.select(".aggregation-axis").call(self.x_axis);
            self.aggregated_graph.selectAll(".grid-line")
                .attr("x1", self.x_scale)
                .attr("x2", self.x_scale);
            self.aggregated_graph.selectAll(".cluster")
                .attr("cx", function(d) { return self.x_scale(self.x(d)); });

        }
    }
}

AggregatedGraph.prototype.getOldestDate = function() {
    var min = this.dataset[0].date;
    this.dataset.forEach(function(data) {
        if (data.date <= min) {
            min = data.date;
        }
    });
    return Number(min);
}

AggregatedGraph.prototype.getLatestDate = function() {
    var max = this.dataset[0].date;
    this.dataset.forEach(function(data) {
        if (data.date >= max) {
            max = data.date;
        }
    });
    return Number(max);
}

AggregatedGraph.prototype.initDataset = function(dataset) {
    var dataset_buf = [];
    var grouped_dataset = [];

    dataset.content.forEach(function(data) {
        grouped_data = {};
        data.value.dates.forEach(function(date, index) {
            if (!grouped_data.hasOwnProperty(date)) {
                grouped_data[date] = [];
            }
            grouped_data[date].push(data.value.msgs[index]);
        });
        grouped_dataset.push({_id: data._id, content: grouped_data});
    });

    grouped_dataset.forEach(function(data) {
        for (timestamp in data.content) {
            data_buf = {};
            if (dataset.type === 'object') { // aggregated by object, so an object can have multiple pids
                data_buf._id = Number(data._id);
            } else { // dataset.type === 'id'
                data_buf.object = data._id;
            }
            data_buf.date = timestamp;
            data_buf.messages = data.content[timestamp];
            dataset_buf.push(data_buf);
        }
    });

    return dataset_buf;
}

AggregatedGraph.prototype.initXRange = function() {
    var start_date = this.getOldestDate();
    var end_date = this.getLatestDate();
    var upper_range = end_date - start_date <= 5000 ? 5000 : end_date - start_date >= 20000 ? end_date - start_date : 10000;
    return [100, upper_range];
}

AggregatedGraph.prototype.initTickInterval = function() {
    // Currently using fixed unit and step for display
    var unit_options = [
        d3.time.minutes.utc
    ];
    var step_options = [
        15
    ];

    var unit_index = 0;
    var step_index = 0;

    this.tick_unit = unit_options[unit_index];
    this.tick_step = step_options[step_index];
}

AggregatedGraph.prototype.initXDomain = function() {
    var x_max = this.dataset[0].date, x_min = this.dataset[0].date;
    this.dataset.forEach(function(data) {
        if (data.date >= x_max) {
            x_max = data.date;
        } else if (data.date <= x_min) {
            x_min = data.date;
        }
    });
    this.x_domain_min = x_min;
    this.x_domain_max = x_max;
}

AggregatedGraph.prototype.initYDomain = function() {
    var self = this;
    //var id_array = [];
    this.y_domain_array = []; // clear old data if any
    if (this.aggregation_type === 'object') {
        //var y_max = this.dataset[0]._id, y_min = this.dataset[0]._id;
        //var id_array = [], median = 0;
        //var median = 0;
        this.dataset.forEach(function(data) {
            /*if (data._id >= y_max) {
                y_max = data._id;
            } else if (data._id <= y_min) {
                y_min = data._id;
            }*/
            self.y_domain_array.push(data._id);
        });
        //median = d3.median(id_array);
        //this.y_domain_min = y_min;
        //this.y_domain_max = y_max > median * 2 ? median + y_min : y_max;
    } else { // aggregation type is pid
        //var domain_index = 1;
        //var domain_increment = 5;
        this.dataset.forEach(function(data) {
            //if (!self.y_domain_map.hasOwnProperty(data.object)) {
            //    self.y_domain_map[data.object] = domain_index;
            //    if ($.inArray(domain_index, id_array) === -1)
            //        id_array.push(domain_index);
            //    domain_index += domain_increment;
            //}
            self.y_domain_array.push(data.object);
        });
        //this.y_domain_min = 1; // initial value
        //this.y_domain_max = domain_index - domain_increment; // last domain index
    }
    //this.y_domain_array = id_array;
}

AggregatedGraph.prototype.initRadiusDomain = function() {
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













