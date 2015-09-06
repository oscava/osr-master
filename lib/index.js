var Class = require("./emitter");
var spawn = require("child_process").spawn;
var portfinder = require("portfinder");
var zmq = require("zmq");
var promise = require("promise");
var net = require("net");
var Process = Class.extends({
	isRunning: false,
	process: null,
	task:null,
	$:function( name ){
		this.name = name;
	},
	start:function( main , config){
		var _this = this;
		this.rep = zmq.socket("rep");
		this.main = main;
		this.config = config;
		promise.denodeify(portfinder.getPort)({host:"127.0.0.1"}).then(function( port ){
			//注册 rep服务
			_this.repPort = port;
			_this.rep = zmq.socket("rep");
			_this.rep.bindSync("tcp://127.0.0.1:"+_this.repPort);
			console.log("[SYS]\t注册 rep 服务[port:%s]", _this.repPort, new Date());
			_this.rep.on("message",function( data ){
				var message;
				try{
					message = JSON.parse( data );
				}catch(e){
					return;
				}
				if(!message instanceof Array){
					return;
				}
				_this.repDeal(message);
			});
			return promise.denodeify(portfinder.getPort)({host:"127.0.0.1"});
		}).then(function( port ){
			_this.pubPort = port;
			_this.pub = zmq.socket("pub");
			_this.pub.bindSync("tcp://127.0.0.1:"+_this.pubPort);
			console.log("[SYS]\t注册 pub 服务[port:%s]", _this.pubPort, new Date());
		}).then(function(){
			var params = [__dirname+"/childprocess.js"];
			params.push("--port="+_this.repPort);
			params.push("--name="+_this.name);
			_this.process = spawn('node',params).on("error",function(error){
				_this.isRunning = false;
				_this.emit("event","error",error);
			});
			_this.process.on("exit",function(data){
				_this.isRunning = false;
				_this.emit("event","exit",_this.name);
			});
			_this.process.stderr.on("data",function(data){
				_this.emit("event","error",data.toString());
			});
			_this.process.stdout.on("data",function(data){
				_this.emit("event","print",data.toString());
			});
			_this.isRunning = true;
		}).then(function(){
			_this.emit("event","start",{ repPort: _this.repPort, pubPort: _this.pubPort, channel: _this.name });
		},function(err){
			_this.emit("event","error",err);
		});
	},
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
	}
})

module.exports = exports = Process;