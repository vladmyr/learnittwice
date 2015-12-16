"use strict";

//external dependencies
var Promise = require("bluebird");
var _ = require("underscore");

var DictionaryService = function(app){
  var _instance;

  if(!_instance){
    _instance = (function(){
      var listAll = function(obj, sortBy, options){
        var _options = _.extend({
          include: [],
          order: [["id", "ASC"]],
          limit: 10,
          offset: 0
        }, options);

        return app.models.Lemma.findAndCountAll(_options).then(function(data){
          obj.data = data.rows;
          obj.recourdsFiltered = data.count;

          return app.models.Lemma.count().then(function(count){
            obj.recordsTotal = count;

            return obj;
          });
        })
      };

      return {
        listAll: listAll
      }
    })();
  }

  return _instance;
};

module.exports = DictionaryService;