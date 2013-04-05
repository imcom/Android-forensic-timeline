
// dataset is polymorphism, can be an array of events or a single event
function CallLogs(dataset) {
    this.dataset = dataset;
}

/*exports.fields = [
    "date",
    "duration",
    "type",
    "number",
    "name"
];*/
CallLogs.prototype.unifyDataset = function() {
    var unified_dataset = [];
    this.dataset.forEach(function(data, index) {
        unified_dataset.push(
            {
                _id: index.toString(),
                object: data.name,
                date: data.date,
                msg: data.name + "</br>" + data.duration + "</br>" + data.type,
                display: data.number
            }
        );
    });
    this.dataset = unified_dataset;
    return unified_dataset;
}

CallLogs.prototype.getIdField = function() {
    return "_id";
}

CallLogs.prototype.getObjectField = function() {
    return "object";
}

CallLogs.prototype.getDate = function(index) {
    return this.dataset[index].date;
}

CallLogs.prototype.getId = function() {
    return 0; // no id info
}

CallLogs.prototype.getMessage = function() {
    return this.dataset.number + "</br>Duration: " + this.dataset.duration;
}

CallLogs.prototype.getDisplayName = function() {
    return this.dataset.name;
}
