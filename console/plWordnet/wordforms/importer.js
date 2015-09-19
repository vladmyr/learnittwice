"use strict";

var Promise  = require("bluebird");
var _ = require("underscore");
var path = require("path");

var Importer = function(app, options){
  options = _.extend({
    sourceFile: path.join(__dirname, "source", "wordforms.txt")
  }, options);

  return {
    run: function(callback){
      return app.db.transaction().then(function(t){
        var baseLemma = app.models.Lemma.build({});

        return app.helpers.utils.fs.readFileByLine(options.sourceFile, {}, function(line){
          var innerPromise = Promise.resolve();

          line = _.map(line.split(" > "), function(lemma){
            return lemma.trim();
          });

          if(baseLemma.lemma !== line[1]){
            innerPromise = innerPromise.then(function(){
              return baseLemma = app.models.Lemma.findOrCreate({
                where: {
                  lemma: line[1]
                },
                transaction: t
              });
            });
          }

          return innerPromise

        }).then(function(){
          return app.helpers.utils.db.rollback(t);
        }).catch(function(){
          return app.helpers.utils.db.rollback(t);
        })
      })
    }
  }
};

module.exports = function(app, args, callback){

};