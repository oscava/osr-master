var Process = require("../").Process;
var CODE = require("../").CODE;
var Quant = Process.extends({
	onStart:function(){
		var _this = this;
		setTimeout(function(){
			_this.exit();
		},5000);
	},
	onConfig:function( config ){
		
	}
});

module.exports = exports = new Quant;