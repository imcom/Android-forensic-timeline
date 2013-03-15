/*
 *
 * Timeline class for generating timeline
 * Author: Imcom
 * Date: 2013-03-06
 *
 */
 
function Timeline(
            name,
            timeline_height,
            x_range,
            radius
        ) {
    // static constant values                    
    this.name = name;
    this.y_range_padding = 25; // this number can be a constant, padding from the window top
    this.y_padding = 0.25; // this number can be a constant, since 1 sec is always the interval for Y-axis
    // [[x, timestamp], detail], x is used for distinguish very close events
    this.dataset = [];
    /* [object, pid, level, msg]
    this.data_desc = [];*/

    // dynamically configurable values
    this.timeline_height = timeline_height;
    this.radius = radius;
    this.x_range = x_range; // this should be a variable since width will be adjusted during investigation
    this.timeline;
    this.y_range;
    this.x_default;
    this.x_suspect;
    this.x_padding;
    this.tick_num = 0;
    this.x_domain_min = 0;
    this.x_domain_max = 0;
    this.y_domain_min = 0;
    this.y_domain_max = 0;
    
    /* dragging events handler */
    var self = this;
    this.drag_event = d3.behavior.drag()
        .on('dragstart', function() {
            d3.event.sourceEvent.stopPropagation();
        })
        .on('drag', function(object) {
            var event_id = this.getAttribute('id');
            d3.select(this)
                .attr("cx", object.x = Math.max(self.radius, Math.min(self.x_range[1] - self.radius, d3.event.x)))
                .attr("cy", object.y = Math.max(self.radius, Math.min(self.timeline_height - self.radius, d3.event.y)));
            d3.select('text[id=' + event_id + ']')
                .attr("x", object.x = Math.max(self.radius, Math.min(self.x_range[1] - self.radius, d3.event.x)) + 5)
                .attr("y", object.y = Math.max(self.radius, Math.min(self.timeline_height - self.radius, d3.event.y)));
        });
    
    // dragging timeline position handler
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
    
} // constructor of Timeline

Timeline.prototype.update_x_domain = function(x) {
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
}

Timeline.prototype.update_y_domain = function(y) {
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

Timeline.prototype.getHeight = function() {
    return this.timeline_height;
}

Timeline.prototype.getName = function() {
    return this.name;
}

Timeline.prototype.initTimeline = function() {

    this.timeline = d3.select(this.name)
        .append("svg")
        .attr("width", "100%")
        .attr("height", this.timeline_height);

    this.y_range = [
        this.y_range_padding,
        this.timeline_height - this.y_range_padding
    ];
    
    this.x_default = (this.x_range[1] - this.x_range[0]) * 0.025; // interval * 1/40
    this.x_suspect = this.x_default * 3; //TODO need to verify the offset effect
    this.x_padding = this.x_default * 0.1;
    
    $(this.name).on("doubleTap", function(){
        console.log("double tap fires");
    });

} // init timeline SVG and properties

Timeline.prototype.updateHeight = function(timeline_height) {
    this.timeline_height = timeline_height;
    $(this.name).children().attr("height", timeline_height);
    this.initTimeline();
} // update timeline height on air, call onDataReady after this

Timeline.prototype.clearData = function() {
    this.dataset = [];
    this.tick_num = 0;
    this.x_domain_min = 0;
    this.x_domain_max = 0;
    this.y_domain_min = 0;
    this.y_domain_max = 0;
}

Timeline.prototype.fetchData = function(queries) { // array of query{}: uri, collection, selection, fields, options
    var total = queries.length;
    var excuted = 0;
    var self = this;
    queries.forEach(function(query, index){
        self.query( // invoke class method `query` for Ajax
            query.uri,
            query.collection,
            query.selection,
            query.fields,
            query.options,
            function(self){ // this self is passed from Ajax callback, which refers to Timeline class instance
                excuted += 1;
                if (excuted == total) {
                    self.onDataReady();
                }
            });
    });
}

Timeline.prototype.query = function(uri, collection, selection, fields, options, onQueryComplete) {
    var self = this;
    var query_content = {
            collection: collection,
            selection: selection,
            fields: fields,
    };
    if (options) {
        query_content.options = options;
    }
    
    $.post(
        uri,
        query_content,
        function(data, status, xhr){
            /*init dataset here*/
            if (data.error != 0) {
                //TODO error handling here
                console.log("An error occured");
            } else { // on query success
                var y_starts_on = data.content[0].date;
                var x_starts_on = self.x_default;
                var previous_date = y_starts_on;
                $.each(data.content, function(index) {
                    var event_data = {};
                    if (index == 0) {
                        event_data.coords = [x_starts_on, y_starts_on];
                    } else {
                        if (data.content[index].date == previous_date) {
                            if (self.y_padding + y_starts_on >= previous_date + 1) { // overlap with next timestamp, then roll back
                                x_starts_on += self.x_padding; // set offset on x-axis for distinguish
                                y_starts_on = previous_date + self.y_padding / 2;
                            } else {
                                y_starts_on += self.y_padding;
                            }
                            event_data.coords = [x_starts_on, y_starts_on];
                        } else if (data.content[index].date < previous_date) { // wrong sequence detected                       
                            event_data.coords = [self.x_suspect, data.content[index].date]; // adding an offset for distinguish
                            data.content[index].display = "suspect"; //TODO css class, set a different color for suspect events
                        } else {
                            previous_date = data.content[index].date;
                            y_starts_on = previous_date;
                            x_starts_on = self.x_default;
                            event_data.coords = [self.x_default, y_starts_on];
                            overlap_increment = self.y_padding / 2;
                        }
                    }
                    self.update_x_domain(event_data.coords[0]);
                    self.update_y_domain(event_data.coords[1]);
                    event_data.detail = data.content[index];
                    self.dataset.push(event_data);
                });
                // on query done, callback to caller
                onQueryComplete(self);
            }
        },
        "json" // expected response type
    );
} // function query(argv...)

Timeline.prototype.onDataReady = function() {

    var self = this;
    // calculate how many timestamps in the selected period
    this.tick_num = this.y_domain_max - this.y_domain_min;
    
    var x_scale = d3.scale.linear()
                 .domain([
                            this.x_domain_min,
                            this.x_domain_max
                        ])
                 .range(this.x_range);

    var y_scale = d3.scale.linear()
                 .domain([
                            this.y_domain_min,
                            this.y_domain_max
                        ])
                 .range(this.y_range);
                 
    console.log(this.y_domain_max + "," + this.y_domain_min + "," + this.tick_num);

    this.timeline.selectAll("circle[id=" + this.name.substr(1) + "]")
        .data(this.dataset)
        .enter()
        .append("circle")
        .attr("id", function(data, index){
            return self.name.substr(1) + "-" + data.detail.pid + "-" + index;
        })
        .attr("cx", function(data) {
            return x_scale(data.coords[0]);
        })
        .attr("cy", function(data) {
            return y_scale(data.coords[1]);
        })
        .attr("r", this.radius)
        .call(this.drag_event);

    this.timeline.selectAll("text[id=" + this.name.substr(1) + "]")
        .data(this.dataset)
        .enter()
        .append("text")
        .attr("class", function(data){
            if (data.detail.display) {
                return data.detail.display;
            }
            return "desc";
        })
        .attr("id", this.name.substr(1))
        .text(function(data) {
            return data.detail.object + "[" + data.detail.level + "]" + "/" + data.detail.pid;
        })
        .attr("fill", "blue");

    var text_fields = $("text[id=" + this.name.substr(1) + "]");
    $.each(self.dataset, function(index) {
        text_fields[index].setAttribute("x", x_scale(self.dataset[index].coords[0]) + 5);
        text_fields[index].setAttribute("y", y_scale(self.dataset[index].coords[1]));
        text_fields[index].setAttribute("id", self.name.substr(1) + "-" + self.dataset[index].detail.pid + "-" + index);
        
        var text_field = $('text[id=' + self.name.substr(1) + "-" + self.dataset[index].detail.pid + "-" + index + "]");
        text_field.mouseover(function(event){ /*overwrite the default self object -- [mouse event]*/
            base_y_offset = $('text#' + event.target.id).height();
            $('#popup_detail').css("position", "absolute")
                .css("left", Math.ceil(document.width / 6)) //FIXME not a really good implementation here... magic number...
                .css("top", event.pageY - Math.round(base_y_offset * 0.3) * 10) // round down to the nearest 2-digits number
                .css("opacity", 0.8)
                .text(self.dataset[index].detail.msg);
            this.setAttribute("fill", "purple");
            this.setAttribute("cursor", "pointer");
        })
        .mouseout(function(event){
            this.setAttribute("fill", "blue");
            this.setAttribute("cursor", null);
            $('#popup_detail').css("opacity", 0).text(null); // clear the popup div
        });
        
        text_field.on("click", function(event){
            console.log(event.target.id);
        });
        
        var circle = $('circle[id=' + self.name.substr(1) + "-" + self.dataset[index].detail.pid + "-" + index + "]");
        circle.mouseover(function(event){         
            this.setAttribute("fill", "brown");
            this.setAttribute("cursor", "move");
        })
        .mouseout(function(event){
            this.setAttribute("fill", "black");
            this.setAttribute("cursor", null);
        });
    });

    var y_axis = d3.svg.axis()
        .scale(y_scale)
        .orient("right")
        .ticks(this.tick_num);
        
    y_axis.tickFormat(function(date) {
        date *= 1000; // convert to milliseconds
        formatter = d3.time.format.utc("%Y%m%d %H:%M:%S");
        return formatter(new Date(date));
    });

    this.timeline.append("g")
        .attr("class", "time-axis")
        .attr("id", this.name.substr(1))
        .call(y_axis)
        .call(this.drag_timeline);

    var labels = $("g[id=" + this.name.substr(1) + "]")[0].childNodes;
    $.each(labels, function(index) {
        if (labels[index].nodeName == "g") {
            labels[index].childNodes[1].setAttribute("dy", "-0.5em");
            labels[index].setAttribute("id", self.name.substr(1));
        }
    });

    var rules = this.timeline.selectAll("g[id=" + this.name.substr(1) + "].rule")
        .data(y_scale.ticks(this.tick_num))
        .enter()
        .append("g")
        .attr("class", "rule");

    rules.append("line")
        .attr("y1", y_scale)
        .attr("y2", y_scale)
        .attr("x1", 0)
        .attr("x2", "100%");

} // function onDataReady()




