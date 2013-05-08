


var cursor = db.som_nodes.find(null, {_id: 0});

var result = [];

while(cursor.hasNext()) {
    result.push(cursor.next());
}

if (result.length > 0)
    printjson(result);


