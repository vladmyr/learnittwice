"use strict";

var Promise = require("bluebird");
var _ = require("underscore");
var path = require("path");
var http = require("http");
var https = require("https");

var Glosbe = require(path.join(__dirname, "httpParser/glosbe"));
var Babla = require(path.join(__dirname, "httpParser/babla"));
var Wordnet = require(path.join(__dirname, "httpParser/wordnet"));

var HttpParser = function(app, args) {
  var instance;

  args = _.extend({}, args);

  var init = function(){
    var parseObjects = {
      Glosbe: new Glosbe(app, args).getInstance(),
      Babla: new Babla(app, args).getInstance(),
      Wordnet: new Wordnet(app, args).getInstance()
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