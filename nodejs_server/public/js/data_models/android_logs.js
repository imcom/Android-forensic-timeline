
// dataset is polymorphism, can be an array of events or a single event
function AndroidLogs(dataset) {
    this.dataset = dataset;
}

AndroidLogs.prototype.getDate = function(index) {
    return this.dataset[index].date;
}

AndroidLogs.prototype.getId = function(index) {
    return this.dataset[index].pid;
}

AndroidLogs.prototype.getObject = function(index) {
    return this.dataset[index].object;
}

AndroidLogs.prototype.getMessage = function(index) {
    return this.dataset[index].msg;
}

AndroidLogs.prototype.getDisplayName = function() {
    return this.dataset.object + "[" + this.dataset.level + "]" + "/" + this.dataset.pid;
}