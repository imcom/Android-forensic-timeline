var svg = d3.select("#timeline")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "1500"); // the height of the page should be a variable

var dataset = [
    [50, 1111130],
    [300, 1111130.2],
    [350, 1111130.4],
    [50, 1111132],
    [300, 1111133],
    [50, 1111133.8],
    [300, 1111136],
];

var data_desc = [
    ["event", "1"],
    ["event", "2"],
    ["event", "3"],
    ["event", "4"],
    ["event", "5"],
    ["event", "6"],
    ["event", "7"],
];

var xScale = d3.scale.linear()
             .domain([
                        d3.min(dataset, function(data) { return data[0]; }),
                        d3.max(dataset, function(data) { return data[0]; })
                    ])
             .range([200, 400]);

var yScale = d3.scale.linear()
             .domain([
                        d3.min(dataset, function(data) { return data[1]; }),
                        d3.max(dataset, function(data) { return data[1]; })
                    ])
             .range([50, 1000]);

svg.selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", function(data) {
        return xScale(data[0]);
    })
    .attr("cy", function(data) {
        return yScale(data[1]);
    })
    .attr("r", 3);

svg.selectAll("text.desc")
    .data(data_desc)
    .enter()
    .append("text")
    .attr("class", "desc")
    .text(function(data) {
        return data[0] + "," + data[1];
    })
    .attr("fill", "red");

var text_fields = $("text");
$.each(dataset, function(index) {
    text_fields[index].setAttribute("x", xScale(dataset[index][0]));
    text_fields[index].setAttribute("y", yScale(dataset[index][1]));
    text_fields[index].setAttribute("id", data_desc[index][1]);
});

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("right")
    .ticks(5);

svg.append("g")
    .attr("class", "time-axis")
    .call(yAxis);

var labels = $("g.tick");
$.each(labels, function(index) {
    labels[index].childNodes[1].setAttribute("dy", "-.5em");
});

var rules = svg.selectAll("g.rule")
    .data(yScale.ticks(5))
    .enter()
    .append("g")
    .attr("class", "rule");

rules.append("line")
    .attr("y1", yScale)
    .attr("y2", yScale)
    .attr("x1", 0)
    .attr("x2", "100%");

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

$.ajax({
    type: 'GET',
    url: '/query',
    dataType: 'json',
    success: function(data, status, xhr){
        console.log(status);
        console.log(data.content[0].date);
    },
    error: function(xhr, type){
        console.log("fuck...");
    }
});








