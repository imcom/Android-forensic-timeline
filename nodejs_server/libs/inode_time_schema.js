

exports.EVENT_SCHEMA =
{
    uid: String,
    gid: String,
    mode: String,
    inode: String,
    size: Number,
    allocated: String,
    inode_modified: Number,
    file_modified: Number,
    accessed: Number
};

exports.collections = ['inode_time'];

exports.name = "inode_time_schema";

exports.fields = [
    "uid",
	"gid",
	"mode",
	"inode",
	"size",
	"allocated",
	"inode_modified",
	"file_modified",
	"accessed"
];