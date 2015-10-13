"use strict";

var _ = require("underscore");
var BaseApp = require("rendr/shared/app");

module.exports = BaseApp.extend({
  default: {
    templateAdapter: "rendr-jade"
  },


  initialize: function(){

  },
  start: function(){
      this.router.on("action:start", function(){
        this.set({
          loading: true
        });
      });

      this.router.on("action:end", function(){
        this.set({
          loading: false
        });
      });

      BaseApp.prototype.start.call(this);
  }
});
