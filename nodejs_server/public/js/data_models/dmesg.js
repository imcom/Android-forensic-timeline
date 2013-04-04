// dataset is polymorphism, can be an array of events or a single event
function Dmesg(dataset) {
    this.dataset = dataset;
}

/*exports.fields = [
    "event",
	"date"
];*/
Dmesg.prototype.unifyDataset = function() {
    var unified_dataset = [];
    this.dataset.forEach(function(data, index) {
        unified_dataset.push(
            {
                _id: data.date,
                object: "dmesg",
                date: data.date,
                msg: data.event,
                display: index.toString()
            }
        );
    });
    this.dataset = unified_dataset;
    return unified_dataset;
}

Dmesg.prototype.getDate = function(index) {
    return this.dataset[index].date;
}

Dmesg.prototype.getId = function(index) {
    return this.dataset[index]._id;
}

Dmesg.prototype.getMessage = function(index) {
    return this.dataset[index].msg;
}

Dmesg.prototype.getDisplayName = function(index) {
    return this.dataset[index].display;
}

Dmesg.prototype.getIdField = function() {
    return "_id";
}

Dmesg.prototype.getObjectField = function() {
    return "object";
}