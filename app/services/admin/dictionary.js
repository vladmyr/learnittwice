"use strict";

var Promise = require("bluebird");
var _ = require("underscore");

var DictionaryService = function(){
  var _instance;

  if(!_instance){
    _instance = (function(){
      var getList = function(sortBy, options){
        var _options = _.extend({
          include: [{
            model: null
          }],
          order: [["id", "ASC"]],
          limit: 10,
          offset: 0
        }, options);

        return app.models.Lemma.findAll(_options)
      };

      return {
        getList: getList
      }
    })();
  }

  return _instance;
};

module.exports = DictionaryService;