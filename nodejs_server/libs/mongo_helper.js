exports.read = function mongo_helper(database, collection, onCompletion) {

    var mongoose = require('mongoose');

    mongoose.connect('mongodb://localhost/' + database);

    var LOG_SCHEMA = mongoose.Schema(
        {
            date: Number,
            msg: String,
            object: String,
            pid: String,
            level: String
        }
    );
    
    var model = mongoose.model(collection, LOG_SCHEMA, collection);
    model.find(null, function(err, res) {
        if (err == null) {
            onCompletion(res);
        } else {
            //TODO deal with query failures
        }
    });
/*
    var log_collections = ['dmesg', 'radio', 'events', 'main', 'system'];

    var log_records = {};
    var counter = 1;

    log_collections.forEach( function(collection) {
        var model = mongoose.model(collection, LOG_SCHEMA, collection);
        model.find(null, function(err, res) {
            log_records[collection] = res;
            //console.log(counter + " " + collection);
            if (counter == log_collections.length) {
                onCompletion(log_records);
            }
            counter += 1;
        });
    });
*/
}




