var ocp = require("../");

var oOcp = new ocp("demo");

var fs = require("fs");

oOcp.start(fs.readFileSync(__dirname+"/code.js").toString(),[__dirname+"/code.js"],__dirname+"/code.js",{ channel: 123 , port: 112240});

oOcp.on("event",function(type, msg){
	console.log("-->",type,msg);
});

setTimeout(function(){
	oOcp.stop();
},5000);