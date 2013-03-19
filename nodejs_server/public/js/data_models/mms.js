
// dataset is polymorphism, can be an array of events or a single event
function MMS(dataset) {
    this.dataset = dataset;
}

MMS.prototype.getDate = function(index) {
    return this.dataset[index].date;
}

MMS.prototype.getId = function() {
    return this.dataset._id;
}

MMS.prototype.getMessage = function() {
    return this.dataset.retr_txt;
}

MMS.prototype.getDisplayName = function() {
    return this.dataset.sub;
}