
// dataset is polymorphism, can be an array of events or a single event
function CallLogs(dataset) {
    this.dataset = dataset;
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