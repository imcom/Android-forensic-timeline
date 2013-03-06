
var timeline_height = 5000;
var tick_num;
var y_range_padding = 50;
var x_range = [100, 300];
var y_range = [
                y_range_padding,
                timeline_height - y_range_padding
              ];

var svg = d3.select("#timeline")
        .append("svg")
        .attr("width", "100%")
        .attr("height", timeline_height); // the height of the page should be a variable

var x_suspect = 10;
var y_padding = 0.2;
var x_default = 5;
var x_padding = 0.5;

var default_radius = 5; // suspect radius is larger
// [x, timestamp], x is used for distinguish very close events
var dataset = [];
// [object, pid], onHover, show message
var data_desc = [];
    
$.post(
    '/query',
    {
        collection: "events",
        selection: JSON.stringify({
                        $or: [
                            {object: "dvm_gc_madvise_info"},
                            {object: "dvm_gc_info"}
                        ],
                        date: {
                            $gte: 1362315421,
                            $lte: 1362315481
                        }
                    }),
        fields: "date msg object pid level",
        /*if options are set to null, then just do not add this parameter to the post*/
        //options: null
    },
    function(data, status, xhr){
        /*init dataset here*/
        if (data.error != 0) {
            //TODO error handling here
            console.log("An error occured");
        } else { // on query success
            var y_starts_on = data.content[0].date;
            var x_starts_on = x_default;
            var previous_date = y_starts_on;
            $.each(data.content, function(index){
                if (index == 0) {
                    dataset[index] = [x_starts_on, y_starts_on];
                } else {
                    if (data.content[index].date == previous_date) {
                        if (y_padding + y_starts_on >= previous_date + 1) { // overlap with next timestamp, then roll back
                            x_starts_on += x_padding; // set offset on x-axis for distinguish
                            y_starts_on = previous_date + y_padding;
                        }
                        y_starts_on += y_padding;
                        dataset[index] = [x_starts_on, y_starts_on];
                    } else if (data.content[index].date < previous_date) { // wrong sequence detected, using a different class for display
                        dataset[index] = [x_suspect, data.content[index].date]; // adding an offset for distinguish
                        data.content[index].display = "suspect"; //TODO css class, set different color and change circle's radius attribute
                    } else {
                        previous_date = data.content[index].date;
                        y_starts_on = previous_date;
                        x_starts_on = x_default;
                        dataset[index] = [x_default, y_starts_on];
                    }
                }
                data_desc[index] = data.content[index];
            });
            tick_num = dataset[dataset.length-1][1] - dataset[0][1]; // calculate how many timestamps in the selected period
        }
        // on dataset ready, render the timeline        
        onDataReady();
    },
    "json"
); // dummy ajax call

function onDataReady() {

    var x_scale = d3.scale.linear()
                 .domain([
                            d3.min(dataset, function(data) { return data[0]; }),
                            d3.max(dataset, function(data) { return data[0]; })
                        ])
                 .range(x_range);

    var y_scale = d3.scale.linear()
                 .domain([
                            d3.min(dataset, function(data) { return data[1]; }),
                            d3.max(dataset, function(data) { return data[1]; })
                        ])
                 .range(y_range);

    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", function(data) {
            return x_scale(data[0]);
        })
        .attr("cy", function(data) {
            return y_scale(data[1]);
        })
        .attr("r", default_radius);

    svg.selectAll("text.desc")
        .data(data_desc)
        .enter()
        .append("text")
        .attr("class", "desc")
        .text(function(data) {
            return data.object.trim() + "[" + data.level + "]" + "/" + data.pid.trim();
        })
        .attr("fill", "blue");

    var text_fields = $("text");
    $.each(dataset, function(index) {
        text_fields[index].setAttribute("x", x_scale(dataset[index][0]));
        text_fields[index].setAttribute("y", y_scale(dataset[index][1]));
        text_fields[index].setAttribute("id", data_desc[index][1]);
    });

    var y_axis = d3.svg.axis()
        .scale(y_scale)
        .orient("right")
        .ticks(tick_num);

    svg.append("g")
        .attr("class", "time-axis")
        .call(y_axis);

    var labels = $("g.tick");
    $.each(labels, function(index) {
        labels[index].childNodes[1].setAttribute("dy", "-.5em");
    });

    var rules = svg.selectAll("g.rule")
        .data(y_scale.ticks(tick_num))
        .enter()
        .append("g")
        .attr("class", "rule");

    rules.append("line")
        .attr("y1", y_scale)
        .attr("y2", y_scale)
        .attr("x1", 0)
        .attr("x2", "100%");
} // function onDataReady()


/*The second timeline*/
var svg_1 = d3.select("#events")
        .append("svg")
        .attr("width", 100)
        .attr("height", 100);

svg_1.append("circle")
    .style("stroke", "gray")
    .style("fill", "white")
    .attr("r", 40)
    .attr("cx", 50)
    .attr("cy", 50)
    .on("mouseover", function(){d3.select(this).style("fill", "aliceblue");})
    .on("mouseout", function(){d3.select(this).style("fill", "white");});









