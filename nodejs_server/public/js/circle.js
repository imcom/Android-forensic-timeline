var svg = d3.select("#timeline")
        .append("svg")
        .attr("width", 500)
        .attr("height", 500);

var dataset = [
    [50, 30],
    [300, 30],
    [50, 100],
    [300, 110],
    [50, 170],
    [300, 190],
];

var data_desc = [
    ["event", "1"],
    ["event", "2"],
    ["event", "3"],
    ["event", "4"],
    ["event", "5"],
    ["event", "6"],
];

var xScale = d3.scale.linear()
             .domain([
                        d3.min(dataset, function(data) { return data[0]; }),
                        d3.max(dataset, function(data) { return data[0]; })
                    ])
             .range([50, 200]);

var yScale = d3.scale.linear()
             .domain([
                        d3.min(dataset, function(data) { return data[1]; }),
                        d3.max(dataset, function(data) { return data[1]; })
                    ])
             .range([50, 200]);

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
    .attr("r", function(data) {
        return Math.sqrt(500 - data[1]);
    });

svg.selectAll("text")
    .data(data_desc)
    .enter()
    .append("text")
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
