
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
    this.object = dataset.object;
    this.aggregation_type = dataset.type;
    if (this.aggregation_type === 'object') {
        this.dataset = this.initObjectedDataset(dataset);
    } else {

    }
    this.x_domain_min;
    this.x_domain_max;
    this.y_domain_min;
    this.y_domain_max;
    this.initXDomain();
    this.initYDomain();
    var self = this;

    // generic visualisation functions
    this.radius = function(d) { return d.messages.length; }
    this.x = function(d) { return d.timestamp; }

    // dimensions
    this.width = "100%";
    this.height = 620; // unit: px
    this.x_range = [100, 1400];
    this.y_range = [this.height - 100, 100];

    // init a broader bounds for the selected time window
    var start_date = new Date((this.dataset[0].timestamp - 30) * 1000);
    var end_date = new Date((this.dataset[this.dataset.length - 1].timestamp + 30) * 1000);

    // convert epoch timestamp to date for d3 time scale
    this.dataset.forEach(function(record) {
        var date = new Date(record.timestamp * 1000); // convert to milliseconds
        record.timestamp = date;
    });

    // graph scales
    this.x_scale = d3.time.scale.utc().domain([start_date, end_date]).range(this.x_range);
    this.y_scale = d3.scale.linear().domain(
        [this.y_domain_min, this.y_domain_max]
    ).range(this.y_range);
    this.radius_scale = d3.scale.linear()
        .domain([1, this.maxMessageNumber()])
        .range([10,30]);
    this.color_scale = d3.scale.category10();

    // axes
    this.x_axis = d3.svg.axis()
        .orient("top")
        .scale(this.x_scale)
        .ticks(d3.time.seconds.utc, 15); //TODO this interval should be dynamic

    this.x_axis.tickFormat(function(date) {
        formatter = d3.time.format.utc("%Y%m%d %H:%M:%S");
        return formatter(date);
    });

    // create svg for aggregated graph
    this.aggregated_graph = d3.select(this.name)
        .append("svg")
        .attr("class", "aggregated-graph")
        .attr("width", this.width)
        .attr("height", this.height);

    // call draw function depending on dataset type
    if (this.aggregation_type === 'object') {
        this.drawAggregatedByObject();
    } else {

    }

    this.aggregated_graph.append('g')
        .attr("class", "aggregation-axis")
        .attr("transform", "translate(0, " + (this.height - 50) + ")")
        .call(this.x_axis);

    this.grid = this.aggregated_graph.selectAll("line.grid")
        .data(this.x_scale.ticks(d3.time.seconds.utc, 15)) //TODO interval here
        .enter()
        .append("g")
        .attr("class", "grid");

    this.grid.append("line")
        .attr("y1", 0)
        .attr("y2", this.height - 50)
        .attr("x1", this.x_scale)
        .attr("x2", this.x_scale);

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

AggregatedGraph.prototype.drawAggregatedByObject = function() {
    var self = this;
    var y = function(d) { return d.object_id; }
    var color = function(d) { return d.object_id; }
    var time_indicator;
    var time_label;

    this.clusters = this.aggregated_graph.append("g")
        .attr("id", "clusters")
        .selectAll(".cluster")
        .data(this.dataset)
        .enter().append("circle")
        .attr("class", "cluster")
        .style("fill", function(d) { return self.color_scale(color(d)); })
        .attr("cx", function(d) { return self.x_scale(self.x(d)); })
        .attr("cy", function(d) { return self.y_scale(y(d)); })
        .attr("r", function(d) { return self.radius_scale(self.radius(d)); })
        .sort(function(x, y) {return self.radius(y) - self.radius(x)});

    var circles = $('circle.cluster');
        circles.mouseover(function(event){
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
                    var local_date = self.x_scale.invert(this.getAttribute("cx"));
                    var formatter = d3.time.format.utc("%Y-%m-%d %H:%M:%S (UTC)");
                    return formatter(local_date);
                });
        })
        .mouseout(function(event){
            this.setAttribute("cursor", null);
            time_indicator.remove();
            time_label.remove();
        });

    circles.forEach(function(circle, index) {
        jQuery(circle).opentip(
            self.formatMessages(self.dataset[index].messages),
            {style: "tooltip_style"}
        );
    });

    var legend = this.aggregated_graph.selectAll(".legend")
        .data(this.color_scale.domain().slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", 90)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", this.color_scale);

    legend.append("text")
        .attr("x", 145)
        .attr("y", 10)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
}

AggregatedGraph.prototype.maxMessageNumber = function() {
    var max = 0;
    this.dataset.forEach(function(data) {
        if (data.messages.length >= max) {
            max = data.messages.length;
        }
    });
    return max;
}

AggregatedGraph.prototype.initObjectedDataset = function(dataset) {
    dataset_buf = [];
    dataset.content.forEach(function(data) {
        //if (dataset.type === 'object') {
            if (data.value.is_single != null) {
                var ts = data.value.date;
                var msg = data.value.msg;
                data.value = {};
                data.value[ts] = [msg];
            }
            for (timestamp in data.value) {
                data_buf = {};
                data_buf.object_id = Number(data._id);
                data_buf.timestamp = Number(timestamp);
                data_buf.messages = data.value[timestamp];
                dataset_buf.push(data_buf);
            }
        /*} else { // type is date
            if (data.value.is_single != null) {
                var id = data.value.id;
                var msg = data.value.msg;
                data.value = {};
                data.value[id] = [msg];
            }
            for (id in data.value) {
                data_buf = {};
                data_buf.object_id = Number(id);
                data_buf.timestamp = Number(data._id);
                data_buf.messages = data.value[id];
                dataset_buf.push(data_buf);
            }
        }*/
    });

    return dataset_buf;
}

AggregatedGraph.prototype.initXDomain = function() {
    var x_max = this.dataset[0].timestamp, x_min = this.dataset[0].timestamp;
    this.dataset.forEach(function(data) {
        if (data.timestamp >= x_max) {
            x_max = data.timestamp;
        } else if (data.timestamp <= x_min) {
            x_min = data.timestamp;
        }
    });
    this.x_domain_min = x_min;
    this.x_domain_max = x_max;
}

AggregatedGraph.prototype.initYDomain = function() {
    var y_max = this.dataset[0].object_id, y_min = this.dataset[0].object_id;
    this.dataset.forEach(function(data) {
        if (data.object_id >= y_max) {
            y_max = data.object_id;
        } else if (data.object_id <= y_min) {
            y_min = data.object_id;
        }
    });
    this.y_domain_min = y_min;
    this.y_domain_max = y_max;
}















