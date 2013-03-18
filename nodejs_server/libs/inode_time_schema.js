
var mongoose = require('mongoose');
exports.LOG_SCHEMA = mongoose.Schema(
    {
        uid: Number,
        gid: Number,
        mode: String,
        inode: Number,
        size: Number,
        allocated: Number,
        inode_modified: Number,
        file_modified: Number,
        accessed: Number
    }
);

exports.log_collections = ['inode_time'];

exports.name = "INODE_TIME";

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