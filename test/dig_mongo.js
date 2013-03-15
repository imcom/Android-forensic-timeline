
var db_name = process.argv[2];
var collection_name = process.argv[3];

var fields = "pid object date";
var selection = "";

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/' + db_name);

var LOG_SCHEMA = mongoose.Schema(
    {
        date: Number,
        msg: String,
        object: String,
        pid: String,
        level: String
    }
);

var log_collections = ['dmesg', 'radio', 'events', 'main', 'system'];

log_collections.forEach( function(collection) {
    mongoose.model(collection, LOG_SCHEMA, collection);
});

var model = mongoose.model(collection_name);

if (model) {
    model.find(selection, fields, null, function(err, res) {
        if (err == null) {
            console.log(res);
        } else {
            console.log(err.message);
        }
        onCompletion();
    });
} else {
    console.log("model is not set");
    onCompletion();
}

function onCompletion() {
    mongoose.disconnect();
}
