var Class = require("osr-class");
var child_process = require("child_process");
var Child = require("./child");
var debug = require("debug")("osr-child:main\t");
var Process = require("./process");

var CODE = require("./code");

var OsrMaster = Class.extends({
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
		return child;
	},
	kill:function( pid ){
		this.childs[pid].kill();
	}
});

OsrMaster.Process = Process;

OsrMaster.CODE = CODE;

module.exports = OsrMaster;
