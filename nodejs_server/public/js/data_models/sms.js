
// dataset is polymorphism, can be an array of events or a single event
function SMS(dataset) {
    this.dataset = dataset;
}

/*exports.fields = [
    "body",
    "service_center",
    "address",
    "report_date",
    "cs_timestamp",
    "date",
    "type"
];*/
SMS.prototype.unifyDataset = function() {
    var unified_dataset = [];
    this.dataset.forEach(function(data, index) {
        unified_dataset.push(
            {
                _id: index.toString(),
                object: data.address,
                date: data.date,
                msg: data.body + "</br>" + data.report_date + "</br>" + data.cs_timestamp + "</br>" + data.service_center,
                display: data.address
            }
        );
    });
    this.dataset = unified_dataset;
    return unified_dataset;
}

SMS.prototype.getIdField = function() {
    return "_id";
}

SMS.prototype.getObjectField = function() {
    return "object";
}

SMS.prototype.getDate = function(index) {
    return this.dataset[index].date;
}

SMS.prototype.getId = function() {
    return 0; // no id info
}

SMS.prototype.getMessage = function() {
    return this.dataset.body + "</br>Report date:" + this.dataset.report_date + "</br>Service center:" + this.dataset.service_center;
}

SMS.prototype.getDisplayName = function() {
    return this.dataset.address;
}
