
// dataset is polymorphism, can be an array of events or a single event
function InodeTime(dataset) {
    this.dataset = dataset;
}

InodeTime.prototype.getDate = function(index) {
    return this.dataset[index].accessed;
}

InodeTime.prototype.getId = function() {
    return this.dataset.uid;
}

InodeTime.prototype.getMessage = function() {
    return "Inode modified: " + this.dataset.inode_modified + "\r\nFile modified: " + this.dataset.file_modified + "\r\nSize: " + this.dataset.size + "\r\nMode: " + this.dataset.mode + "\r\nAllocated: " + this.dataset.allocated;
}

InodeTime.prototype.getDisplayName = function() {
    return this.dataset.inode + "[" + this.dataset.uid + "/" + this.dataset.gid + "]";
}