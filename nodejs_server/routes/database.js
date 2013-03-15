/*
 *
 * database query handler
 *
 */
 
var mongo = require('../libs/mongo_helper.js');
var android_log = require('../libs/android_log_schema.js');

function do_query(req, res, type) {
    var fields = req.body.fields.filter(function(item){
        return (type.fields.indexOf(item) != -1);
    });
    mongo.read(
        req.body.collection,
        JSON.parse(req.body.selection),
        fields.join(" "),
        req.body.options,
        function(result){
            if (!result) {
                res.json({"error": 1, "type": type.name, "content": "query returned null"});
            } else {            
                res.json({"error": 0, "type": type.name, "content": result});
            }
        }
    );
}

exports.syslogs = function(req, res) {
    console.log("query selection[syslogs]: " + req.body.selection);
    do_query(req, res, android_log);
};




