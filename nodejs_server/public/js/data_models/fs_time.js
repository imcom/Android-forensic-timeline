
// dataset is polymorphism, can be an array of events or a single event
function FSTime(dataset) {
    this.dataset = dataset;
}

/*exports.fields = [
    "uid",
	"perms",
	"gid",
	"file",
	"activity",
	"date",
	"inode",
	"size"
];*/
FSTime.prototype.unifyDataset = function() {
    var unified_dataset = [];
    this.dataset.forEach(function(data, index) {
        unified_dataset.push(
            {
                _id: data.inode,
                object: data.file,
                date: data.date,
                msg: "[</br>&nbsp&nbsp" + data.activity + "</br>&nbsp&nbsp" + data.perms + "</br>&nbsp&nbsp" + data.size + "</br>&nbsp&nbsp]",
                display: data.uid + "/" + data.gid
            }
        );
    });
    this.dataset = unified_dataset;
    return unified_dataset;
}

FSTime.prototype.getIdField = function() {
    return "_id";
}

FSTime.prototype.getObjectField = function() {
    return "object";
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