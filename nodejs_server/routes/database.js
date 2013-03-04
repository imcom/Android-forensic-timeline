/*
 *
 * database query handler
 *
 */
 
var mongo = require('../libs/mongo_helper.js');
 
exports.db_helper = function(req, res) {
    //TODO collection, selection, options should be a parameter from request
    mongo.read("radio", null, null, function(result){
        if (!result) {
            res.json({"error": 1, "content": "query returned null"});
        } else {            
            res.json({"error": 0, "content": result});
        }
    });
};
