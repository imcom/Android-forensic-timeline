
// dataset is polymorphism, can be an array of events or a single event
function Contacts(dataset) {
    this.dataset = dataset;
}

/*exports.fields = [
    "phone_number",
    "display_name",
    "contact_status",
    "last_time_contacted",
    "email",
    "starred",
    "contact_status_ts"
];*/
Contacts.prototype.unifyDataset = function() {
    var unified_dataset = [];
    this.dataset.forEach(function(data, index) {
        unified_dataset.push(
            {
                _id: index.toString(),
                object: data.display_name,
                date: data.last_time_contacted,
                msg: data.phone_number + "</br>" + data.email,
                display: data.display_name
            }
        );
    });
    this.dataset = unified_dataset;
    return unified_dataset;
}

Contacts.prototype.getIdField = function() {
    return "_id";
}

Contacts.prototype.getObjectField = function() {
    return "object";
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
