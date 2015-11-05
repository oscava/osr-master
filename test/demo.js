var Process = require("../").Process;
var CODE = require("../").CODE;
var Quant = Process.extends({
	onStart:function(){
		var _this = this;
		this.on("config",function(config){
			console.log("..config",config);
		});
		setTimeout(function(){
			_this.exit();
		},5000);
	}
});

module.exports = exports = new Quant;