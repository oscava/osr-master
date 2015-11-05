var OsrMaster = require("../");

var master = new OsrMaster();

var child = master.fork(__dirname+"/demo.js");

child.send(OsrMaster.CODE.CONFIG.CODE,{
	appid:"appid...",
	appkey:"appkey...",
});