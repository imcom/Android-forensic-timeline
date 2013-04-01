
var timeline_0 = new Timeline(
    "#timeline_0",
    3000,
    [120, 400],
    5
);

timeline_0.initTimeline();

var query_1 = [
    {
        uri: "/android_logs",
        collection: "main",
        selection: JSON.stringify({
            pid: "1502",
            date: {
                $gte: 1363281140,
                $lte: 1363282140
            },
            level: 'D'
        }),
        fields: ["date", "msg", "object", "pid", "level"],
        options: null
    }
];

timeline_0.fetchData(query_1);
/*
var query_2 = [{
    uri: "/android_logs",
    collection: "main",
    selection: JSON.stringify({
        pid: "1502",
        date: {
            $gte: 1363283140
        }
    }),
    fields: ["date", "msg", "object", "pid", "level"],
    options: null
}];

timeline_0.removeTimeline();
timeline_0.initTimeline();
timeline_0.fetchData(query_2);
*/

/*The second timeline*/
var timeline_1 = new Timeline(
    "#timeline_1",
    3000,
    [120, 400],
    5
);

var query_2 = [
    {
        uri: "/fs_time",
        collection: "fs_time",
        selection: JSON.stringify({
            date: {
                $gte: 1362129603,
                $lte: 1362132603
            }
        }),
        fields: null,
        options: null
    }
];

timeline_1.initTimeline();
timeline_1.fetchData(query_2);




