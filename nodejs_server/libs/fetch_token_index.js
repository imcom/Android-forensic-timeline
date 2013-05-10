


var cursor = db.token_hash.find();

var result = [];

while(cursor.hasNext()) {
    result.push(cursor.next());
}

if (result.length > 0)
    printjson(result);


