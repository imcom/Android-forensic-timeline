

// dataset is polymorphism, can be an array of events or a single event
function ApplicationTrace(dataset) {
    this.dataset = dataset;
}

//exports.fields = ["date", "pid", "object", "msg", "level"];
ApplicationTrace.prototype.unifyDataset = function() {
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
