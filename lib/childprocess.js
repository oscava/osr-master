/**
 * Created by Administrator on 2015/9/15.
 */

"use strict";

var Class = require("osr-class");

var fs = require("fs");

var promise = require("promise");

var urlencode = require("urlencode");

var ioredis = require("ioredis");

var debug = require("debug")("osr");

var ChildProcess = Class.extends({
    $:function( path ){
        this.path = urlencode.decode(path);
        this.init();
    },
    init:function(){
        var _this = this;
        promise.denodeify(fs.readFile)(this.path).then(function( config ){
            //读取配置文件
            _this.config = JSON.parse( config );
			_this.publish("::sys",{ method: "loadconfig", result: _this.config });
            return _this.config;
        }).then(function(){
			var puburl = _this.config.puburl || "redis://127.0.0.1:6379/2";
			_this.publish("::sys",{ method: "pub-bind", result: puburl });
            _this.pub = new ioredis();
            _this.pub.on("error",function(err){
				_this.publish("::sys",{ method: "error", result: err });
            });
            return promise.denodeify(_this.pub.on).bind(_this.pub)("connect");
		}).then(function(){
            //查找入口文件
            var main = _this.config.main;
            if(!main)throw new Error("我需要主入口文件");
            _this.mainClass = require(main);
			_this.publish("::sys",{ method: "load-main", result: main });
            return _this.mainClass;
        }).then(function( mainClass ){
            //实例化入口文件
            _this.main = new mainClass(_this);
			_this.publish("::sys",{ method: "instance-main", result: mainClass.toString() });
            return _this.main;
        }).then(function( main ){
            //初始化入口函数
			_this.publish("::sys",{ method: "init-main", result: main.init.toString() });
            main.init( _this.config );
        }).then(function(success){
            //console.log("启动成功!");
			_this.publish("::sys", { method: "start", result: true });
        },function(err){
            //console.log("启动失败!",err);
            _this.publish("::sys", { method: "error", result: err.message });
            process.exit();
        });
    },
    publish:function(){
		var input = [].slice.call(arguments);
		var cmd = input.shift();
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
        if(this.pub){
            this.pub.publish(this.config.channel+"@"+cmd,result.join(" "));
        }else{
			console.log(result.join(" "));
		}
    }
});

new ChildProcess(process.argv[2]);