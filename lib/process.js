var Class = require("osr-class");
var CODE = require("./code");
var Process = Class.extends({
	$:function(){
		var _this = this;
		process.on("message",function( data ,file){
			switch( data.event ){
				case CODE.START.CODE:
					break;
				case CODE.EXIT.CODE:
				process.kill(process.pid);
					break;
			}
		});
	}
});

module.exports = Process;