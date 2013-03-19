
// dataset is polymorphism, can be an array of events or a single event
function FSTime(dataset) {
    this.dataset = dataset;
}

FSTime.prototype.getDate = function(index) {
    return this.dataset[index].accessed;
}

FSTime.prototype.getId = function() {
    return this.dataset.uid;
}

FSTime.prototype.getMessage = function() {
    return "Inode modified: " + this.dataset.inode_modified + "\r\nFile modified: " + this.dataset.file_modified + "\r\nSize: " + this.dataset.size + "\r\nMode: " + this.dataset.mode + "\r\nAllocated: " + this.dataset.allocated;
}

FSTime.prototype.getDisplayName = function() {
    return this.dataset.inode + "[" + this.dataset.uid + "/" + this.dataset.gid + "]";
}