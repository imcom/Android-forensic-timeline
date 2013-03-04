/*
 *
 * database query handler
 *
 */
 
var mongo = require('../libs/mongo_helper.js');
 
exports.db_helper = function(req, res) {
    console.log(req.toString());
    mongo.read("imcom", "radio", function(result){
        console.log("radio records #:" + result[result.length-1]);
        res.write(result[result.length-1].toString());
        res.end();
    });

};
