
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
    return this.dataset.body + "\r\nReport date: " + this.dataset.report_date + "\r\nService center: " + this.dataset.service_center;
}

SMS.prototype.getDisplayName = function() {
    return this.dataset.address;
}