
// dataset is polymorphism, can be an array of events or a single event
function Services(dataset) {
    this.dataset = dataset;
}

Services.prototype.getDate = function(index) {
    return this.dataset[index].launch_date;
}

Services.prototype.getId = function() {
    return this.dataset.pid;
}

Services.prototype.getMessage = function() {
    return "Last activity date: " + this.dataset.last_activity_date;
}

Services.prototype.getDisplayName = function() {
    return this.dataset.name;
}