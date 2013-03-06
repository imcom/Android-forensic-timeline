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
    this.y_range_padding = 80; // this number can be a constant, padding from the window top
    this.y_padding = 0.25; // this number can be a constant, since 1 sec is always the interval for Y-axis
    // [x, timestamp], x is used for distinguish very close events
    this.dataset = [];
    // [object, pid, level, msg], TODO on hover show msg of the event
    this.data_desc = [];
    // the height of the SVG should be a variable
    this.timeline = d3.select(this.name)
        .append("svg")
        .attr("width", "100%")
        .attr("height", timeline_height);

    // dynamically configurable values
    this.timeline_height = timeline_height;
    this.radius = radius;
    this.x_range = x_range; // this should be a variable since width will be adjusted during investigation
    this.timeline;
    this.y_range;
    this.x_default;
    this.x_suspect;
    this.x_padding;
    this.tick_num;
    
} // constructor of Timeline

Timeline.prototype.initTimeline = function() {
    this.y_range = [
        this.y_range_padding,
        this.timeline_height - this.y_range_padding
    ];
    
    this.x_default = (this.x_range[1] - this.x_range[0]) * 0.025; // interval * 1/40
    this.x_suspect = this.x_default * 3; //TODO need to verify the offset effect
    this.x_padding = this.x_default * 0.1;
    
    $(this.name).on("singleTap", function(){
        console.log("single tap fires");
    });
    
    $(this.name).on("doubleTap", function(){
        console.log("double tap fires");
    });
    
    $(this.name).on("click", function(){
        console.log("click fires");
    });
} // init timeline SVG and properties

Timeline.prototype.updateTimelineHeight = function(timeline_height) {
    this.timeline_height = timeline_height;
    $(this.name).children().attr("height", timeline_height);
    this.initTimeline();
} // update timeline height on air, call onDataReady after this

Timeline.prototype.query = function(uri, collection, selection, fields, options) {

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
                    if (index == 0) {
                        self.dataset[index] = [x_starts_on, y_starts_on];
                    } else {
                        if (data.content[index].date == previous_date) {
                            if (self.y_padding + y_starts_on >= previous_date + 1) { // overlap with next timestamp, then roll back
                                x_starts_on += self.x_padding; // set offset on x-axis for distinguish
                                y_starts_on = previous_date + self.y_padding;
                            }
                            y_starts_on += self.y_padding;
                            self.dataset[index] = [x_starts_on, y_starts_on];
                        } else if (data.content[index].date < previous_date) { // wrong sequence detected, using a different class for display
                            self.dataset[index] = [self.x_suspect, data.content[index].date]; // adding an offset for distinguish
                            data.content[index].display = "suspect"; //TODO css class, set a different color for suspect events
                        } else {
                            previous_date = data.content[index].date;
                            y_starts_on = previous_date;
                            x_starts_on = self.x_default;
                            self.dataset[index] = [self.x_default, y_starts_on];
                        }
                    }
                    self.data_desc[index] = data.content[index];
                });
                // calculate how many timestamps in the selected period
                self.tick_num = self.dataset[self.dataset.length-1][1] - self.dataset[0][1];
                // on dataset ready, render the timeline
                self.onDataReady();
            }
        },
        "json" // expected response type
    );
} // function query(argv...)

Timeline.prototype.onDataReady = function() {

    var self = this;
    var x_scale = d3.scale.linear()
                 .domain([
                            d3.min(this.dataset, function(data) { return data[0]; }),
                            d3.max(this.dataset, function(data) { return data[0]; })
                        ])
                 .range(this.x_range);

    var y_scale = d3.scale.linear()
                 .domain([
                            d3.min(this.dataset, function(data) { return data[1]; }),
                            d3.max(this.dataset, function(data) { return data[1]; })
                        ])
                 .range(this.y_range);

    this.timeline.selectAll("circle[id=" + this.name.substr(1) + "]")
        .data(this.dataset)
        .enter()
        .append("circle")
        .attr("id", this.name.substr(1))
        .attr("cx", function(data) {
            return x_scale(data[0]);
        })
        .attr("cy", function(data) {
            return y_scale(data[1]);
        })
        .attr("r", this.radius);

    this.timeline.selectAll("text[id=" + this.name.substr(1) + "]")
        .data(this.data_desc)
        .enter()
        .append("text")
        .attr("class", "desc")
        .attr("id", this.name.substr(1))
        .text(function(data) {
            return data.object.trim() + "[" + data.level + "]" + "/" + data.pid.trim();
        })
        .attr("fill", "blue");

    var text_fields = $("text[id=" + this.name.substr(1) + "]");
    $.each(self.dataset, function(index) {
        text_fields[index].setAttribute("x", x_scale(self.dataset[index][0]));
        text_fields[index].setAttribute("y", y_scale(self.dataset[index][1]));
        text_fields[index].setAttribute("id", self.name.substr(1) + "-" + self.data_desc[index].pid.trim() + "-" + index);
        
        var text_field = $('#' + self.name.substr(1) + "-" + self.data_desc[index].pid.trim() + "-" + index);
        text_field.mouseover(function(event){ /*overwrite the default self object -- [mouse event]*/
            base_y_offset = $('#' + event.target.id).height();
            $('#popup_detail').css("position", "absolute")
                .css("left", Math.ceil(document.width / 5)) //FIXME not a really good implementation here...
                .css("top", event.pageY - Math.round(base_y_offset * 0.3) * 10) // round down to the nearest 2-digits number
                .text(self.data_desc[index].msg.trim());
            this.setAttribute("fill", "red");
            this.textContent = self.data_desc[index].msg.trim();
        })
        .mouseout(function(event){
            this.setAttribute("fill", "blue");
            this.textContent = self.data_desc[index].object.trim() +
                                "[" + self.data_desc[index].level + "]" +
                                "/" + self.data_desc[index].pid.trim();
            $('#popup_detail').text(null); // clear the popup div
        });
    });

    var y_axis = d3.svg.axis()
        .scale(y_scale)
        .orient("right")
        .ticks(this.tick_num);

    this.timeline.append("g")
        .attr("class", "time-axis")
        .attr("id", this.name.substr(1))
        .call(y_axis);

    var labels = $("g.tick");
    $.each(labels, function(index) {
        labels[index].childNodes[1].setAttribute("dy", "-0.5em");
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




