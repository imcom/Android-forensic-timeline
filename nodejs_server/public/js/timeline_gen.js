
var timeline_0 = new Timeline(
    "#timeline_0",
    10000,
    [100, 300],
    5
);

timeline_0.initTimeline();

var query_1 = [
    {
        uri: "/syslogs",
        collection: "main",
        selection: JSON.stringify({
            pid: 1502,
            date: {
                $gte: 1363283140
            }
        }),
        fields: ["date", "msg", "object", "pid", "level"],
        options: null
    },
    /*{
        uri: "/syslogs",
        collection: "main",
        selection: JSON.stringify({
            pid: 1502,
            date: {
                $gte: 1363281140,
                $lte: 1363282140
            },
            level: 'D'
        }),
        fields: ["date", "msg", "object", "pid", "level"],
        options: null
    }*/
];

timeline_0.fetchData(query_1);

/*
timeline_0.query(
    "/syslogs",
    "main",
    JSON.stringify({
        pid: 1502,
        date: {
            $gte: 1363283140
        }
    }),
    ["date", "msg", "object", "pid", "level"],
    null // if options are set to null, then just do NOT add this parameter to the post (using null)
);*/

/*The second timeline*/
var timeline_1 = new Timeline(
    "#timeline_1",
    5000,
    [100, 300],
    4
);
/*
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
);*/



