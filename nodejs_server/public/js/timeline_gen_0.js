


/*The second timeline*/
var timeline_1 = d3.select("#timeline_1")
        .append("svg")
        .attr("width", 100)
        .attr("height", 100);

timeline_1.append("circle")
    .style("stroke", "gray")
    .style("fill", "white")
    .attr("r", 40)
    .attr("cx", 50)
    .attr("cy", 50)
    .on("mouseover", function(){d3.select(this).style("fill", "aliceblue");})
    .on("mouseout", function(){d3.select(this).style("fill", "white");});


var timeline = new Timeline(
    "#timeline_0",
    5000,
    [100, 300],
    3
);

timeline.initTimeline();

//timeline.updateTimelineHeight(2000);

timeline.query(
    "/query",
    "events",
    JSON.stringify({
        $or: [
            {object: "dvm_gc_madvise_info"},
            {object: "dvm_gc_info"}
        ],
        date: {
            $gte: 1362315421,
            $lte: 1362315481
        }
    }),
    "date msg object pid level",
    null // null options
);

/*
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
//if options are set to null, then just do NOT add this parameter to the post
//options: null
},
*/


