
// dataset is polymorphism, can be an array of events or a single event
function InodeTime(dataset) {
    this.dataset = dataset;
}

/*exports.fields = [
    "uid",
	"gid",
	"mode",
	"inode",
	"size",
	"allocated",
	"inode_modified",
	"file_modified",
	"accessed"
];*/
InodeTime.prototype.unifyDataset = function() {
    var unified_dataset = [];
    this.dataset.forEach(function(data, index) {
        unified_dataset.push(
            {
                _id: data.inode,
                object: data.inode,
                date: data.file_modified,
                msg: "[</br>&nbsp&nbsp" + data.accessed + "</br>&nbsp&nbsp" + data.inode_modified + "</br>&nbsp&nbsp" + data.mode + "</br>&nbsp&nbsp" + data.size + "</br>&nbsp&nbsp]",
                display: data.uid + "/" + data.gid + "[" + data.allocated + "]"
            }
        );
    });
    this.dataset = unified_dataset;
    return unified_dataset;
}

InodeTime.prototype.getIdField = function() {
    return "_id";
}

InodeTime.prototype.getObjectField = function() {
    return "object";
}

InodeTime.prototype.getDate = function(index) {
    return this.dataset[index].file_modified;
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