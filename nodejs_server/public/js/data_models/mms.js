
// dataset is polymorphism, can be an array of events or a single event
function MMS(dataset) {
    this.dataset = dataset;
}

/*exports.fields = [
	"retr_txt",
	"cs_timestamp",
	"sub",
	"date",
	"read_status"
];*/
MMS.prototype.unifyDataset = function() {
    var unified_dataset = [];
    this.dataset.forEach(function(data, index) {
        unified_dataset.push(
            {
                _id: index.toString(),
                object: data.sub,
                date: data.date,
                msg: data.retr_txt + "</br>" + data.cs_timestamp + "</br>" + data.read_status,
                display: data.sub
            }
        );
    });
    this.dataset = unified_dataset;
    return unified_dataset;
}

MMS.prototype.getIdField = function() {
    return "_id";
}

MMS.prototype.getObjectField = function() {
    return "object";
}

MMS.prototype.getDate = function(index) {
    return this.dataset[index].date;
}

MMS.prototype.getId = function() {
    return this.dataset._id;
}

MMS.prototype.getMessage = function() {
    return "[" + this.dataset.read_status + "]" + this.dataset.retr_txt;
}

MMS.prototype.getDisplayName = function() {
    return this.dataset.sub;
}
