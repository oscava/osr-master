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
<<<<<<< HEAD
	kill:function( pid ){
		this.childs[pid].kill();
=======
	repDeal:function( message ){
		// console.log(message);
		var cmd = message.shift();
		var status = message.shift();
		var name = message.shift();
		var result = message.shift();
		switch( cmd ){
			case "child_process":
				this.childBuildSuccess(status,result);
			break;
		}
	},
	childBuildSuccess:function(status, result){
		if("success" == status){
			var _this = this;
			this.task = result;
			this.sendTask( this.main, this.config );
			this.sub = zmq.socket("sub");
			this.sub.connect("tcp://127.0.0.1:"+this.task.pub);
			this.sub.on("message",function( channel, message){
				_this.emit("event","childprocess", message.toString() );
			});
			this.sub.subscribe(this.name);
		}else{
			this.emit("event","error",result);
		}
	},
	publish:function(){
		var input = [].splice.call(arguments);
		var result = [];
		input.forEach(function(item,index){
			if(typeof(item) == "object"){
				result.push(JSON.stringify(item));
			}else if(typeof(item) == "function"){
				return;
			}else{
				result.push(item);
			}
		})
		var array = [this.name].concat(result.join(" "));
		this.pub.send(array);
	},
	sendTask:function( main, config ){
		this.post( JSON.stringify(["start",main,config]) );
	},
	stop:function(){
		if(this.isRunning && this.process){
			this.process.kill();
			this.process = null;
			delete this.process;
			delete this;
		}
	},
	post:function( msg ){
		var req = zmq.socket("req");
		req.connect("tcp://127.0.0.1:"+this.task.rep);
		req.send( msg );
>>>>>>> refs/remotes/origin/master
	}
});

OsrChild.Process = Process;

module.exports = OsrChild;
