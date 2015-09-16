/**
 * Created by Administrator on 2015/9/15.
 */
"use strict";
var Emitter = require("./emitter");

var spawn = require("child_process").spawn;

var promise = require("promise");

var fs = require("fs");

var urlencode = require("urlencode");

var debug = require("debug")("osr");

var ioredis = require("ioredis");

var Process = Emitter.extends({
    isRunning:false,
    process:null,
    task:null,
    //构造函数
    $:function( name , options ){
        this.name = name;
        this.channel = urlencode(name);
        this.options = options || {};
        this.options.basedir = this.options.basedir || __dirname+"/../tmp";
        this.options.mq = this.options.mq || { url:"redis://127.0.0.1:6379/2" };
		var _this = this;
		this.on("event",function(event,result){
			_this.emit(event,result);
		});
		this.on("sys",function(event,result){
			if("start" == event || "exit" == event){
				_this.emit(event,_this);
			}
			debug(event,JSON.stringify(result));
		});
    },
    //启动
    start:function( config ){
        var _this = this;
        var path = this.options.basedir+"/"+urlencode(this.name)+".conf";
        //写配置文件
        config.channel = this.name;
        promise.denodeify(fs.writeFile)(path,JSON.stringify(config)).then(function(file){
            //连接Redis-MQ
            _this.mq = new ioredis(_this.options.mq.url);
            return _this.mq;
        }).then(function(){
            _this.sub = new ioredis(config.puburl || "redis://127.0.0.1:6379/2");
            _this.sub.on("pmessage",function(reg, channel, message){
                var cmd = channel.substring(channel.indexOf("@")+1);
				var data = JSON.parse(message);
                if("::sys" === cmd){
					_this.emit("sys", data.method, data.result );
				}else if("::normal" === cmd){
					_this.emit("event",data.method, data.result );
				}
            });
            _this.sub.psubscribe(_this.name+"@*");
        }).then(function(){
            var params = [__dirname+"/childprocess.js"];
            params.push(urlencode(path));
            //启动子进程
            _this.process = spawn('node',params).on("error",function( error ){
                _this.isRunning = false;
                _this.emit("event","error",error);
            });
            _this.process.on("exit",function(data){
                _this.isRunning = false;
                delete _this.process;
                _this.mq.quit();
                delete _this.mq;
                _this.emit("sys","exit",true);
            });
            _this.process.stderr.on("data",function(data){
                _this.emit("event","stderr",data.toString());
            });
            _this.process.stdout.on("data",function(data){
                _this.emit("event","stdout",data.toString());
            });
            _this.isRunning = true;
            _this.starttime = Date.now();
        }).then(function(){
            debug("程序启动成功!");
        },function(err){
            _this.emit("sys","error",err);
        });
    },
    //推送
    publish:function(){
        if(this.mq){
            var input = [].slice.call(arguments);
            var result = [];
            input.forEach(function(item,index){
                if(typeof(item) == "object"){
                    result.push(JSON.stringify(item))
                }else if(typeof(item)=="function"){
                    return;
                }else{
                    result.push(item);
                }
            });
            this.mq.publish(this.channel,result.join(" "),debug);
        }
    },
    stop:function(){
        if(this.process){
            this.process.kill();
        }
    }
});

module.exports = Process;