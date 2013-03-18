
var mongoose = require('mongoose');
exports.LOG_SCHEMA = mongoose.Schema(
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