
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

AndroidLogs.prototype.getIdField = function() {
    return "pid";
}

AndroidLogs.prototype.getObjectField = function() {
    return "object";
}

//exports.fields = ["date", "pid", "object", "msg", "level"];
AndroidLogs.prototype.unifyDataset = function() {
    var unified_dataset = [];
    this.dataset.forEach(function(data) {
        unified_dataset.push(
            {
                _id: data.pid,
                object: data.object,
                date: data.date,
                msg: data.msg,
                level: data.level,
                display: data.pid
            }
        );
    });
    return unified_dataset;
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