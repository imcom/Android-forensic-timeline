
// dataset is polymorphism, can be an array of events or a single event
function Services(dataset) {
    this.dataset = dataset;
}

/*exports.fields = [
    "last_activity_date",
    "launch_date",
    "pid",
    "name"
];*/
Services.prototype.unifyDataset = function() {
    var unified_dataset = [];
    this.dataset.forEach(function(data, index) {
        unified_dataset.push(
            {
                _id: data.pid,
                object: data.name,
                date: data.launch_date,
                msg: data.last_activity_date,
                display: data.name
            }
        );
    });
    this.dataset = unified_dataset;
    return unified_dataset;
}

Services.prototype.getIdField = function() {
    return "_id";
}

Services.prototype.getObjectField = function() {
    return "object";
}

Services.prototype.getDate = function(index) {
    return this.dataset[index].launch_date;
}

Services.prototype.getId = function() {
    return this.dataset.pid;
}

Services.prototype.getMessage = function() {
    return "Last activity date:" + this.dataset.last_activity_date;
}

Services.prototype.getDisplayName = function() {
    return this.dataset.name;
}
