/**
 * Created by Administrator on 2015/9/15.
 */

"use strict";

var Class = require("osr-class");

var EventEmitter = require("events").EventEmitter;

var Emitter = Class.extends(EventEmitter);

module.exports = Emitter;
