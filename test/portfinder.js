var net = require("net");

var server = net.createServer(function(req,res){
	console.log(req,res);
});
server.on("listening",function(){
	console.log("----")
})
server.on("error",function(e){
	console.log(e);
})

server.listen(8000);
