var Class = require("osr-class");
var child_process = require("child_process");
var Child = require("./child");
var debug = require("debug")("osr-childprocess");
var Process = require("./process");

var CODE = require("./code");

var OsrChild = Class.extends({
	$:function(){
		this.childs = {};
		this.childNumber = 0;
	},
	fork:function( file ){
		var _this = this;
		var child = new Child( file );
		child.on("exit",function( pid ){
			debug( CODE.EXIT.TEXT, pid, this.file );
			delete _this.childs[pid];
		});
		child.on("disconnect",function( pid ){
			debug( CODE.DISCONNECT.TEXT, pid, this.file );
		});
		child.on("connect",function( pid ){
			debug( CODE.CONNECT.TEXT, pid, this.file )
			_this.childs[pid] = this;
		});
		child.fork();
		return child.process.pid;
	},
	kill:function( pid ){
		this.childs[pid].kill();
	}
});

OsrChild.Process = Process;

module.exports = OsrChild;