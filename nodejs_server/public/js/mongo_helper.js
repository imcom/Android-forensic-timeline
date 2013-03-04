var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/imcom');

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

var log_records = {};
var counter = 1;

log_collections.forEach( function(collection) {
    var model = mongoose.model(collection, LOG_SCHEMA, collection);
    model.find(null, function(err, res) {
        log_records[collection] = res;
        console.log(counter + " " + collection);
        if (counter == log_collections.length) {
            onCompletion(log_records);
        }
        counter += 1;
    });
});


function onCompletion(log_records) {
    console.log(log_records['radio'].length);
    mongoose.disconnect();
}

