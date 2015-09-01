var Class = require("osr-class");

var Demo = Class.extends({
	$:function(cp){
		this.cp = cp;
	},
	init:function(config){
		console.log("--->",config);
	}
})

module.exports = Demo;