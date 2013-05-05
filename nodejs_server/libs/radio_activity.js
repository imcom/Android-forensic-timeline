

var cursor;
cursor = db.radio.find({msg: {$in: [new RegExp(/^SMS send complete.*/), new RegExp(/^New SMS.*/)]}}, {_id: 0});
var result = [];
while(cursor.hasNext()) {
    result.push(cursor.next());
}

if (result.length > 0)
    printjson(result);




