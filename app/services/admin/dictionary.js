"use strict";

var Promise = require("bluebird");
var _ = require("underscore");

var DictionaryService = function(app){
  var _instance;

  if(!_instance){
    _instance = (function(){
      var listAll = function(sortBy, options){
        var _options = _.extend({
          include: [],
          order: [["id", "ASC"]],
          limit: 10,
          offset: 0
        }, options);

        return app.models.Lemma.findAll(_options)
      };

      return {
        listAll: listAll
      }
    })();
  }

  return _instance;
};

module.exports = DictionaryService;