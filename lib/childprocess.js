var Class = require("osr-class");
var argh = require("argh");
var zmq = require("zmq");
var promise = require("promise");
var portfinder = require("portfinder");
var ChildProcess = Class.extends({
	$:function( params ){
		this.reqPort = params.port;
		this.name = params.name;
		this.req = zmq.socket("req");
		this.rep = zmq.socket("rep");
		this.pub = zmq.socket("pub");
	},
	init: function(){
		var _this = this;
		this.req.connect("tcp://127.0.0.1:"+this.reqPort);
		promise.denodeify(portfinder.getPort)({host:"127.0.0.1"}).then(function( port ){
			_this.rep.bindSync("tcp://127.0.0.1:"+port);
			_this.rep.on("message",function(data){
				var message;
				try{
					message = JSON.parse( data );
				}catch(e){
					return;
				}
				if(! message  instanceof Array){
					return;
				}
				_this.repDeal( message );
			});
			_this.repPort = port;
			return promise.denodeify(portfinder.getPort)({host:"127.0.0.1"});
		}).then(function( port ){
			_this.pubPort = port;
			_this.pub.bindSync("tcp://127.0.0.1:"+_this.pubPort);
		}).then(function(){
			_this.req.send(JSON.stringify([ "child_process" , "success" , _this.name , { rep: _this.repPort , pub: _this.pubPort }]));
		},function(err){
			_this.req.send(JSON.stringify([ "child_process" , "fail" , _this.name , err ]));
		})
	},
	start:function(){
		var _this = this;
		this.models = {};
		if(this.main){
			this.mainClass = require(this.main);
		}
		if(this.mainObj){
			this.mainObj.init( this.config );
		}
	},
	repDeal:function( message ){
		var cmd = message.shift();
		switch( cmd ){
			case "start":
				this.main = message.shift();
				this.config = message.shift();
				this.start();
				break;
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
	}
});

module.exports = exports = ChildProcess;

new ChildProcess(argh(process.argv)).init();