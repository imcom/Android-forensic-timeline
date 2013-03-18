
var mongoose = require('mongoose');
exports.LOG_SCHEMA = mongoose.Schema(
    {
        uid: String,
        gid: String,
        perms: String,
        file: String,
        activity: String,
        inode: String,
        size: Number,
        date: Number
    }
);

exports.log_collections = ['fs_time'];

exports.name = "FILESYSTEM_TIME";

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