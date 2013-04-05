
// dataset is polymorphism, can be an array of events or a single event
function Applications(dataset) {
    this.dataset = dataset;
}

/*
exports.fields = [
    "last_update_date",
    "data_dir",
    "name",
    "class_name",
    "first_install_date",
    "pub_source_dir",
    "requested_permissions",
    "source_dir",
    "permissions"
];*/
Applications.prototype.unifyDataset = function() {
    var unified_dataset = [];
    this.dataset.forEach(function(data, index) {
        unified_dataset.push(
            {
                _id: index.toString(),
                object: data.name,
                date: data.last_update_date,
                msg: data.data_dir + "</br>" + data.class_name + "</br>" + data.first_install_date + "</br>" + data.pub_source_dir + "</br>" + data.requested_permissions + "</br>" + data.source_dir + "</br>" + data.permissions,
                display: data.name
            }
        );
    });
    this.dataset = unified_dataset;
    return unified_dataset;
}

Applications.prototype.getIdField = function() {
    return "_id";
}

Applications.prototype.getObjectField = function() {
    return "object";
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
