/*
 *
 * database query handler
 *
 */
 
var mongo = require('../libs/mongo_helper.js');

exports.db_helper = function(req, res) {
    //TODO collection, selection, fields, options should be parameters from request
    console.log(req.body.selection);
    mongo.read(
        req.body.collection,
        JSON.parse(req.body.selection),
        req.body.fields,
        req.body.options,
        function(result){
            if (!result) {
                res.json({"error": 1, "content": "query returned null"});
            } else {            
                res.json({"error": 0, "content": result});
            }
        }
    );
};
