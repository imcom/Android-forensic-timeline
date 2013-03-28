
// dataset is polymorphism, can be an array of events or a single event
function Applications(dataset) {
    this.dataset = dataset;
}

Applications.prototype.getDate = function(index) {
    return this.dataset[index].last_update_date;
}

Applications.prototype.getId = function() {
    return 0; // no id info
}

Applications.prototype.getMessage = function() {
    return this.dataset.first_install_date + "</br>" + this.dataset.permissions;
}

Applications.prototype.getDisplayName = function() {
    return this.dataset.name;
}