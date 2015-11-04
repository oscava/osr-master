var OsrChild = require("../");

var child = new OsrChild();

var pid = child.fork(__dirname+"/demo.js");

setTimeout(function(){
	child.kill(pid);
},2000);