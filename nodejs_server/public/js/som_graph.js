

// name selects the div for bearing svg
function SOMGraph(name, nodes, app_traces) {
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
    this.nodes = nodes;
    this.dataset = app_traces;
    this.token_index;

    // dimensions
    var width = 1800;
    var height = 820;

    // threshold of temporal distance [default to 5]
    var dist_threshold = 5;

    // configs are global vars in som_config.js which is a symbolic link
    var som_width = _width; // defaults to 5
    var som_height = _height; // defaults to 3
    this.extent = _extent; // defaults to 20

    // define SOM axes domain
    var x_domain = [];
    for (var i = 0; i < som_width; ++i) {
        x_domain.push(i * this.extent);
    }
    var y_domain = [];
    for (var i = 0; i < som_height; ++i) {
        y_domain.push(i * this.extent);
    }

    // init X axis scale
    this.x_scale = d3.scale.ordinal()
        .domain(x_domain)
        .rangePoints([150, width], 1.5);
        //.range([x_padding * 3, width - x_padding]);

    // init Y axis scale
    this.y_scale = d3.scale.ordinal()
        .domain(y_domain)
        .rangePoints([height, 0], 1.5);
        //.range([height - y_padding * 3, y_padding]);

    // color scale for different apps
    this.color_scale = d3.scale.category20();

    // define radius function
    var radius = function(d) { return d.count; }

    // define X axis function
    var x = function(d) { return d.x * self.extent; }

    // define Y axis function
    var y = function(d) { return d.y * self.extent; }

    var max_count = 0;
    for (var index in nodes) {
        if (index === undefined) continue;
        if (nodes[index].count > max_count) max_count = nodes[index].count;
    }
    // define radius range
    this.radius_range = [5, Math.round(height / som_width)];
    var radius_scale = d3.scale.sqrt()
        .domain([1, max_count])
        .range(this.radius_range)
        .clamp(true);

    // create svg for aggregated graph
    var som_graph = d3.select(this.name)
        .append("svg")
        .attr("class", "som-graph")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(0, 20)");

    /* draw grid lines on the graph */
    // vertical lines
    var grid_y = som_graph.selectAll("line.grid-line-y")
        .data(x_domain)
        .enter()
        .append("g")
        .attr("class", "grid-som-y");
    grid_y.append("line")
        .attr("class", "grid-line-y")
        .attr("y1", 0)
        .attr("y2", height)
        .attr("x1", this.x_scale)
        .attr("x2", this.x_scale);
    // horizontal lines
    var grid_x = som_graph.selectAll("line.grid-line-x")
        .data(y_domain)
        .enter()
        .append("g")
        .attr("class", "grid-som-x");
    grid_x.append("line")
        .attr("class", "grid-line-x")
        .attr("y1", this.y_scale)
        .attr("y2", this.y_scale)
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
        .style("fill", 'gray')
        .style("opacity", "0.1")
        .style('stroke', 'black')
        .attr("cx", function(d) { return self.x_scale(x(d)); })
        .attr("cy", function(d) { return self.y_scale(y(d)); })
        .attr("r", function(d) { return radius_scale(radius(d)); })
        .sort(function(x, y) {return radius(y) - radius(x)});

    // draw apps in each node on graph
    var offset_range = _.range(-this.radius_range[1] + this.extent, this.radius_range[1] - this.extent, 8);
    for (var index in nodes) {
        offset_range = _.shuffle(offset_range); // shuffle the offset range every time
        som_graph.append("g")
            .selectAll(".node-app-" + index)
            .data(nodes[index].extra_data.apps)
            .enter().append("circle")
            .attr("class", "node-app-" + index)
            .style("fill", function(d) {
                return self.color_scale(d);
            })
            .attr("cx", function(d, i) {
                return self.x_scale(nodes[index].x * self.extent) + offset_range[i];
            })
            .attr("cy", function(d, i) {
                var y_offset = (i * i) % offset_range.length;
                return self.y_scale(nodes[index].y * self.extent) + offset_range[y_offset];
            })
            .attr("r", 5);
    }

    // append legend to the graph
    var legend = som_graph.selectAll(".legend")
        .data(this.color_scale.domain().slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 14 + ")"; });

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 8)
        .attr("height", 8)
        .style("fill", this.color_scale);

    legend.append("text")
        .attr("x", 10)
        .attr("y", 5)
        .attr("dy", ".25em")
        .style("text-anchor", "start")
        .text(function(d) {
            return d.substr(4); // remove `com.` to save space
        });

    // graph title, explaination of the graph
    som_graph.append("text")
        .attr("class", "stack-graph-title")
        .attr("x", (width / 2))
        .attr("y", 0)
        .text("Self-Organizing Map of Device Activities");

    // cluster path generator
    this.cluster_path = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate("basis");

    // cluster path color generator
    this.path_color_scale = d3.scale.category20();

    // cluster features description generator
    var formatMessage = function(features) {
        var message = "";
        message += "Duration: " + features[0] + "[seconds]";
        message += "</br>";
        message += "Events #: " + features[1];
        message += "</br>";
        message += "System Calls #: " + features[2];
        message += "</br>";
        message += "Database Opr #: " + features[4];
        message += "</br>";
        message += "ContentProvider Opr #: " + features[5];
        message += "</br>";
        message += "Network Opr #: " + features[6];
        message += "</br>";
        return message;
    }

    // generate time reference for each cluster
    for (var index in nodes) {
        if (index === undefined) continue;
        nodes[index].extra_data.time_ref = [];
        nodes[index].extra_data.time_ref.push(d3.min(nodes[index].extra_data.start_date)); // min date
        nodes[index].extra_data.time_ref.push(d3.median(nodes[index].extra_data.start_date)); // median date
        nodes[index].extra_data.time_ref.push(d3.max(nodes[index].extra_data.start_date)); // max date
        nodes[index].extra_data.time_ref.push(standard_deviation(nodes[index].extra_data.start_date)); // standard deviation of date sample
    }

    // draw path for cluster apps and cluster time relations
    for (var index in nodes) {
        if (index === undefined) continue;
        var cluster = $('#node-' + index);
        var center = {x: Number(cluster.attr('cx')), y: Number(cluster.attr('cy'))};
        var cluster_apps = $('.node-app-' + index);
        cluster_apps.forEach(function(app) {
            var site = {
                x: Number($(app).attr('cx')),
                y: Number($(app).attr('cy'))
            };
            var path_data = [center, site];
            som_graph.append('svg:path')
                .attr("d", self.cluster_path(path_data))
                .attr("stroke", self.path_color_scale(index)) // index of map nodes
                .attr("stroke-width", 0.8)
                .attr("fill", "none");
        }, this); // specify the scope in callback
        // set opentip content for map node
        jQuery("#node-" + index).opentip(formatMessage(nodes[index].features), {style: "tooltip_style"});
        // add mouse event animation
        cluster.mouseover(function(event) {
            var event_self = this;
            this.setAttribute("cursor", "pointer");
        })
        .mouseout(function(event) {
            this.setAttribute("cursor", null);
        });

        // calculate time distance of clusters
        var dist_list = [];
        for (var _index in nodes) {
            if (_index === undefined || _index === index) continue;
            var dist = temporal_distance(nodes[index].extra_data.time_ref, nodes[_index].extra_data.time_ref);
            dist_list[_index] = dist;
        }

        // connect temporally close clusters
        for (var _index in dist_list) {
            if (_index === undefined) continue;
            if (dist_list[_index] <= dist_threshold) {
                var close_cluster = $('#node-' + _index);
                var close_site = {x: Number(close_cluster.attr('cx')), y: Number(close_cluster.attr('cy'))};
                var random_offset = _.random(-20, 20);
                var assist_site = {x: (center.x + close_site.x) / 2, y: (center.y + close_site.y) / 2 + random_offset};
                var time_path = [center, assist_site, close_site];
                som_graph.append('svg:path')
                    .attr("id", "temporal-conn")
                    .attr("d", this.cluster_path(time_path))
                    .attr("stroke", this.path_color_scale(index))
                    .attr("stroke-width", 0.8)
                    .attr("stroke-dasharray", "10,10,5")
                    .attr("fill", "none");
            }
        }
    } // for loop over map nodes
    // pre-fetch token hashes from DB
    this.prepareTokenIndex();
    // remove pid from object string in dataset
    this.pureObjects();
}

SOMGraph.prototype.pureObjects = function() {
    this.dataset.forEach(function(data) {
        for (var process in data.content) {
            if (process === undefined) continue;
            for (var _index in data.content[process]) {
                if (_index === undefined) continue;
                data.content[process][_index].object = data.content[process][_index].object.substring(0, data.content[process][_index].object.indexOf('['));
            }
        }
    });
}

SOMGraph.prototype.prepareTokenIndex = function() {
    var self = this;
    $.ajax({
        type: "POST",
        url: "token_index",
        data: {
            type: "exec"
        },
        dataType: 'json',
        success: function(data) {
            if (data.content.length > 0) {
                self.token_index = JSON.parse(data.content);
            } else {
                showAlert("no token index found!");
            }
        },
        error: function(xhr, type) {
            showAlert("token index query error!");
        }
    });
}

SOMGraph.prototype.appendApps = function(app_list) {
    var self = this;
    var apps = this.dataset.filter(function(data) {
        return app_list.indexOf(data.name) !== -1;
    });
    // remove old rects (apps)
    d3.selectAll("#selected-app").remove();

    var input_vectors = [];
    for (var index in apps) {
        if (index === undefined) continue;
        for (var process in apps[index].content) {
            if (process === undefined || apps[index].content[process].length === 0) continue;
            var activity_vector = {};
            activity_vector.name = apps[index].name; // application owns this activity
            activity_vector.start_date = apps[index].content[process][0].date; //TODO it is likely that date is not accurate
            var result = vectorize(apps[index].content[process]);
            activity_vector.vector = result.vector;
            // replace token hash by tokens
            activity_vector.vector[3] = result.token_index.value;
            // add activity vector to input vector array
            input_vectors.push(activity_vector);
        } // for loop for processes
    }

    // finding most likely index for activity tokens and then replace it in the vector
    for (var index in input_vectors) {
        if (index === undefined) continue;
        var tokens = input_vectors[index].vector[3];
        input_vectors[index].tokens = tokens; // adding an attribute to IV for display later
        var min_dist = 1000000000;
        var bm_index = -1; // best matching index in token index list
        // calculate distance between vector tokens and token index
        for (var _index in this.token_index) {
            if (_index === undefined) continue;
            var dist = getTokenDistance(tokens, this.token_index[_index].value);
            if (dist < min_dist && dist < tokens.length) { //TODO need some experiments to refine threshold
                min_dist = dist;
                bm_index = _index;
            }
        }
        input_vectors[index].vector[3] = Number(bm_index);
    }

    //FIXME re-write the following parts
    // finalize IV and set coordinates to each vector
    var iv_size = input_vectors.length;
    for (var index in input_vectors) {
        if (index === undefined) continue;
        var vector = input_vectors[index].vector;
        //var min_dist = 1000000000;
        var bm_coords = []; // best matching coordinates
        //var dist_dataset = {};
        //dist_dataset.iv = vector;
        //dist_dataset.nodes = this.nodes;
        //dist_dataset.covar_inv = this.covar_matrix;
        $.ajax({
            type: "POST",
            url: "coords",
            data: {
                iv: JSON.stringify(vector),
                index: index, // reserving index in transmission since AJAX is made async, so the index will be over-written before the previous call finishes
                name: input_vectors[index].name,
                type: "exec"
            },
            dataType: 'json',
            success: function(data) {
                var result = JSON.parse(data.content);
                if (result.coords !== '') {
                    var bm_coords = result.coords.split(',');
                    // set input vector coords
                    input_vectors[Number(result.index)].x = Number(bm_coords[0]);
                    input_vectors[Number(result.index)].y = Number(bm_coords[1]);
                } else {
                    showAlert("WARN! Unclassified activities found in:</br>" + result.name);
                    input_vectors[Number(result.index)].x = -1;
                    input_vectors[Number(result.index)].y = -1;
                }
                iv_size -= 1;
                if (iv_size === 0) onInputVectorFinalised();
            },
            error: function(xhr, type) {
                showAlert("coordinates query error!");
            }
        });
    } // for-loop on input_vectors

    // callback function on matching calculation complete
    function onInputVectorFinalised() {
        // put the input vector in SOM
        var offset_range = _.range(-self.radius_range[1] / 2 + self.extent, self.radius_range[1] / 2 - self.extent, 8);
        d3.select('.som-graph').append("g")
            .selectAll("#selected-app")
            .data(input_vectors)
            .enter().append("rect")
            .attr("id", "selected-app")
            .attr("class", function(d, index){ return "selected-app-" + index; })
            .style("fill", function(d) {
                if (d.x >= 0 && d.y >= 0) {
                    return self.color_scale(d.name);
                } else {
                    return "black";
                }
            })
            .attr("x", function(d, i) {
                if (d.x >= 0) {
                    return self.x_scale(d.x * self.extent) + offset_range[i];
                } else {
                    return d.x + i * 30;
                }
            })
            .attr("y", function(d, i) {
                if (d.y >= 0) {
                    var y_offset = (i * i) % offset_range.length;
                    return self.y_scale(d.y * self.extent) + offset_range[y_offset];
                } else {
                    return d.y;
                }
            })
            .attr("width", 15)
            .attr("height", 15)
            .attr("rx", 3)
            .attr("ry", 3);

        for (var index in input_vectors) {
            if (index === undefined) continue;
            var app = jQuery(".selected-app-" + index);
            app.opentip(
                function(d) {
                    var formatter = d3.time.format.utc("%Y-%m-%d %H:%M:%S (UTC)");
                    var date = new Date(d.start_date * 1000);
                    var message = "";
                    message += "app: ";
                    message += d.name;
                    message += "</br>";
                    message += "start date: ";
                    message += formatter(date);
                    message += "</br>";
                    message += "Duration: " + d.vector[0] + "[seconds]";
                    message += "</br>";
                    message += "Events #: " + d.vector[1];
                    message += "</br>";
                    message += "System Calls #: " + d.vector[2];
                    message += "</br>";
                    message += "Database Opr #: " + d.vector[4];
                    message += "</br>";
                    message += "ContentProvider Opr #: " + d.vector[5];
                    message += "</br>";
                    message += "Network Opr #: " + d.vector[6];
                    message += "</br>";
                    return message;
                }(input_vectors[index]),
                {style: "tooltip_style"}
            );
            app.mouseover(function(event) {
                this.setAttribute("cursor", "pointer");
            })
            .mouseout(function(event) {
                this.setAttribute("cursor", null);
            });
        }
        $('#progress-bar').animate({"bottom": 0}, 100, "ease", showProgressBar);
    } // on ajax complete callback
} // function appendApp

function getTokenDistance(x, y) {
    var common = _.intersection(x, y);
    var diff = _.difference(x, y);
    if (common.length === 0) return diff.length;
    return diff.length / common.length;
}

SOMGraph.prototype.onThresholdChange = function(threshold) {
    // clear old temporal connections
    d3.selectAll("#temporal-conn").remove();
    // calculate new temporal connections
    for (var index in this.nodes) {
        if (index === undefined) continue;
        var cluster = $('#node-' + index);
        var center = {x: Number(cluster.attr('cx')), y: Number(cluster.attr('cy'))};

        // calculate time distance of clusters
        var dist_list = [];
        for (var _index in this.nodes) {
            if (_index === undefined || _index === index) continue;
            var dist = temporal_distance(this.nodes[index].extra_data.time_ref, this.nodes[_index].extra_data.time_ref);
            dist_list[_index] = dist;
        }

        // connect temporally close clusters
        for (var _index in dist_list) {
            if (_index === undefined) continue;
            if (dist_list[_index] <= threshold) {
                var close_cluster = $('#node-' + _index);
                var close_site = {x: Number(close_cluster.attr('cx')), y: Number(close_cluster.attr('cy'))};
                var random_offset = _.random(-20, 20);
                var assist_site = {x: (center.x + close_site.x) / 2, y: (center.y + close_site.y) / 2 + random_offset};
                var time_path = [center, assist_site, close_site];
                d3.select('.som-graph g').append('svg:path')
                    .attr("id", "temporal-conn")
                    .attr("d", this.cluster_path(time_path))
                    .attr("stroke", this.path_color_scale(index))
                    .attr("stroke-width", 0.8)
                    .attr("stroke-dasharray", "10,10,5")
                    .attr("fill", "none");
            }
        }
    }
}

// calculate temporal distance using euclidean distance
function temporal_distance(x, y) {
    var sum = 0.0;
    for (var index in x.slice(0, -1)) {
        sum += Math.pow(x[0] - y[0], 2);
    }
    var euclidean_dist = Math.sqrt(sum, 2);
    var deviations = [x[x.length - 1], y[y.length - 1]];
    return euclidean_dist * (d3.max(deviations) / d3.min(deviations));
}

function standard_deviation(x) {
    var mean = d3.mean(x);
    var size = x.length;
    var sum = 0.0;
    x.forEach(function(v) {
        sum += Math.pow(v - mean, 2);
    });
    return Math.sqrt(sum / size, 2);
}







