

exports.read = function(collection, selection, fields, options, onCompletion) {

    var mongoose = require('mongoose');
    var model = mongoose.model(collection);

    if (model) {
        model.find(selection, fields, options, function(err, res) {
            if (err == null) {
                onCompletion(res);
            } else {
                console.log(err.message);
                //TODO deal with query failures
            }
        });
    } else {
        console.log("model is not set");
        //TODO deal with if model is not set yet
    }
}



