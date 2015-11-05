var Class = require("osr-class");
var ChildProcess = require("child_process");
var EventEmitter = require("events").EventEmitter;
var Emitter = Class.extends(EventEmitter);
var CODE = require("./code");
var Child = Emitter.extends({
	$: function( file ){
		this.file = file;
	},
	fork: function(){
		var _this = this;
		this.process = ChildProcess.fork( this.file );
		this.process.on("message", function( msg ){
			_this.emit( msg.event, msg.result );
		});
		this.process.on("exit", function(){
			_this.emit("exit",_this.process.pid );
		});
		this.process.on("close", function(){
			_this.emit("close",_this.process.pid );
		});
		this.process.on("error", function( msg ){
			_this.emit("error", msg )
		});
		this.process.on("disconnect", function(){
			_this.emit("disconnect",_this.process.pid );
		});
		this.emit("connect",this.process.pid);
		// this.process.stdout.on("data",function(data){
			// _this.emit("stdout",data.toString());
		// });
		// this.process.stderr.on("data",function(data){
			// _this.emit("stderr",data.toString());
		// });
		this.send( CODE.START.CODE );
		this.pid = this.process.pid;
		return this;
	},
	send: function( event, result ){
		this.process.send({ event: event, result: result });
	},
	exit: function(){
		this.send( CODE.EXIT.CODE );
	},
	kill: function(){
		this.exit();
	}
});

module.exports = Child;