var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/imcom');

mongoose.connection.db.collectionNames(function(err, names){
    console.log(names);
    mongoose.disconnect();
});

var LOG_SCHEMA = mongoose.Schema(
    {
        date: 'number',
        msg: 'string',
        object: 'string',
        pid: 'string',
        level: 'string'
    },
    {
        collection: ''
    {
);

var RADIO = mongoose.model('Radio', LOG_SCHEMA);


/*

{ "_id" : ObjectId("5133c1692e61db04693b3d73"), "date" : 1362342357, "msg" : "[UNSL]< UNSOL_SIGNAL_STRENGTH {13, 99, -1, -1, -1, -1, 0, -1, -1, 0, 0, 0, 0, 0}\r", "object" : "RILJ", "pid" : " 1625", "level" : "D" }

*/
