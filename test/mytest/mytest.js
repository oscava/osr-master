/**
 * Created by Administrator on 2015/9/15.
 */

"use strict";

var Cp = require("../../");

var cp = new Cp("我测试一下",{ basedir: __dirname + "/tmp" });

var eventLog = require("debug")("event");

var sysLog = require("debug")("sys");

cp.on("event",function(event,msg){
	eventLog(event,msg);
});
cp.on("start",function( ocp ){
	console.log( "start", ocp.name );
	// cp.stop();
});

cp.on("exit",function( ocp ){
	console.log( "exit", ocp.name );
});

cp.start({ main: __dirname+"/mycode" });


