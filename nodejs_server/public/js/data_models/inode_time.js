
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
    return "Inode modified:" + this.dataset.inode_modified + "</br>File modified:" + this.dataset.file_modified + "</br>Size:" + this.dataset.size + "</br>Mode:" + this.dataset.mode + "</br>Allocated:" + this.dataset.allocated;
}

InodeTime.prototype.getDisplayName = function() {
    return this.dataset.inode + "[" + this.dataset.uid + "/" + this.dataset.gid + "]";
}