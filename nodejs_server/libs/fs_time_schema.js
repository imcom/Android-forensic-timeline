

exports.EVENT_SCHEMA =
{
    uid: String,
    gid: String,
    perms: String,
    file: String,
    activity: String,
    inode: String,
    size: Number,
    date: Number
};

exports.collections = ['fs_time'];

exports.name = "fs_time_schema";

exports.fields = [
    "uid",
	"perms",
	"gid",
	"file",
	"activity",
	"date",
	"inode",
	"size"
];