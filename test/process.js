"use strict";

var should = require("should");

var ChildProcess = require("../");

describe("Base",function(){
	describe("process.name",function(){
		it("The Process's name should be 我的子进程\/?bb",function(){
			var process = new ChildProcess( "我的子进程\/?bb" );
			process.name.should.eql("我的子进程\/?bb");
		});
	});
});

describe("Running",function(){
	describe("process.start",function(){
		it("The Process start should be instanceof ChildProcess",function(done){
			var process = new ChildProcess("myprocess");
			process.on("start",function( pro ){
				pro.should.be.an.instanceof(ChildProcess);
				done();
			});
			process.start({ main: __dirname+"/mytest/mycode"});
		})
	});
	describe("process.exit",function(){
		it("The Process exit should be instanceof ChildProcess",function( done ){
			var process = new ChildProcess("myprocess");
			process.on("exit",function( pro ){
				pro.should.be.an.instanceof(ChildProcess);
				done();
			});
			process.start({});
		})
	});
});



