"use strict";

var RendrClientRouter = require("rendr/client/router")

var Router = function (options){
  RendrClientRouter.call(this, options);
}

Router.prototype = Object.create(RendrClientRouter.prototype);
Router.prototype.constructor = RendrClientRouter;

Router.prototype.initialize = function(){
  
}
