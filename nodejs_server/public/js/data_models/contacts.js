
// dataset is polymorphism, can be an array of events or a single event
function Contacts(dataset) {
    this.dataset = dataset;
}

Contacts.prototype.getDate = function(index) {
    return this.dataset[index].last_time_contacted;
}

Contacts.prototype.getId = function() {
    return this.dataset._id;
}

Contacts.prototype.getMessage = function() {
    return this.dataset.phone_number + "</br>" + this.dataset.email;
}

Contacts.prototype.getDisplayName = function() {
    return this.dataset.display_name;
}