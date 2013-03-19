
// dataset is polymorphism, can be an array of events or a single event
function AndroidLogs(dataset) {
    this.dataset = dataset;
}

AndroidLogs.prototype.getDate = function(index) {
    return this.dataset[index].date;
}

AndroidLogs.prototype.getId = function() {
    return this.dataset.pid;
}

AndroidLogs.prototype.getMessage = function() {
    return this.dataset.msg;
}

AndroidLogs.prototype.getDisplayName = function() {
    return this.dataset.object + "[" + this.dataset.level + "]" + "/" + this.dataset.pid;
}