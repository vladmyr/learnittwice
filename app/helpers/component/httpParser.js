"use strict";

var Promise = require("bluebird");
var path = require("path");
var http = require("http");
var https = require("https");

var Glosbe = require(path.join(__dirname, "httpParser/glosbe"));

var HttpParser = function(app, args) {
  var instance;

  var init = function(){
    var parseObjects = {
      Glosbe: new Glosbe(app, args).getInstance()
    };

    return parseObjects;
  };

  return {
    getInstance: function(){
      !instance && (instance = init());
      return instance;
    }
  }
};

module.exports = HttpParser;