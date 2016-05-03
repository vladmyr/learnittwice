'use strict';

const Array = require('./modules/Array');
const Express = require('./modules/Express');
const Fs = require('./modules/Fs');
const Mongoose = require('./modules/Mongoose');
const Net = require('./modules/Net');
const String = require('./modules/String');
const Typecast = require('./modules/Typecast');

class Util {}

Util.Array = Array;
Util.Express = Express;
Util.Fs = Fs;
Util.Mongoose = Mongoose;
Util.Net = Net;
Util.String = String;
Util.Typecast = Typecast;

module.exports = Util;