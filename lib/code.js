var debug = require("debug")('STATUS-CODE');
var cluster = require("cluster");
var CODE = {};

var index = 0;

var DISCONNECT  = "[disconnect]";
var EXIT		= "[exit      ]";
var CONNECT		= "[connect   ]";
var START 		= "[start     ]";

Object.defineProperty(CODE,"DISCONNECT",{
	get:function(){
		if(!this._disconnect){
			this._disconnect = ++index;
		}
		return { CODE: this._disconnect, TEXT: DISCONNECT }
	}
});

Object.defineProperty(CODE,"EXIT",{
	get:function(){
		if(!this._exit){
			this._exit = ++index;
		}
		return { CODE: this._exit , TEXT: EXIT }
	}
});

Object.defineProperty(CODE,"CONNECT",{
	get:function(){
		if(!this._connect){
			this._connect = ++index;
		}
		return { CODE: this._connect, TEXT: CONNECT}
	}
});

Object.defineProperty(CODE,"START",{
	get:function(){
		if(!this._start){
			this._start = ++index;
		}
		return { CODE: this._start, TEXT: START }
	}
});

debug(CODE.DISCONNECT);
debug(CODE.EXIT);
debug(CODE.CONNECT);
debug(CODE.START);



module.exports = CODE;