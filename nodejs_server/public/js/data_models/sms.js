
// dataset is polymorphism, can be an array of events or a single event
function SMS(dataset) {
    this.dataset = dataset;
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