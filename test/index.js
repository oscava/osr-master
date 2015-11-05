var OsrMaster = require("../");

var master = new OsrMaster();

var child = master.fork(__dirname+"/demo.js");

// child.send(OsrMaster.CODE.CONFIG.CODE,{
	// appid:"appid...",
	// appkey:"appkey...",
// });

child.send("config",{
	appid:"appid",
	appkey:"appkey"
},function(config){
	
});

child.send("demo",{
	name:"demo"
},function(demo){
});

child.on("msg",function( data, handle ){
	this.send(handle,"====你说呢");
})