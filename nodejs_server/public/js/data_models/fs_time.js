
// dataset is polymorphism, can be an array of events or a single event
function FSTime(dataset) {
    this.dataset = dataset;
}

FSTime.prototype.getDate = function(index) {
    return this.dataset[index].date;
}

FSTime.prototype.getId = function() {
    return this.dataset.uid;
}

FSTime.prototype.getMessage = function() {
    return "Activity:" + this.dataset.activity + "</br>Permissions:" + this.dataset.perms + "</br>Size:" + this.dataset.size + "</br>Inode:" + this.dataset.inode;
}

FSTime.prototype.getDisplayName = function() {
    return this.dataset.file + "[" + this.dataset.uid + "/" + this.dataset.gid + "]";
}