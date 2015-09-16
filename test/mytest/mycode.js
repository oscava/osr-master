var Class = require("osr-class");

var Quant = Class.extends({
    $:function( cp ){
        this.cp = cp ;
    },
    init:function( config ){
        this.publish("hello","demo");
        var _this = this;
        setInterval(function(){
            _this.publish("demo",Date.now());
        },1000);
    },
    publish:function(method,msg){
        this.cp.publish("::normal",{method:method,result:msg});
    }
});

module.exports = Quant;