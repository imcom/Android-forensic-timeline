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

/*The second timeline*/
var timeline_1 = new Timeline(
    "#timeline_1",
    5000,
    [100, 300],
    3
);

timeline_1.initTimeline();

timeline_1.query(
    "/query",
    "events",
    JSON.stringify({
        $or: [
            {object: "am_proc_start"},
            {object: "am_proc_bound"}
        ],
        date: {
            $gte: 1362315421,
            $lte: 1362315481
        }
    }),
    "date msg object pid level",
    null // null options
);



