"use strict";

var $ = require("jquery")(window);
var _ = require("underscore");
var Backbone = require("backbone");

var Base = Backbone.View.extend({
  el: "body",
  initialize: function(){
    this.render();
  },
  render: function(){
    this.$el.append("Hello world");
  }
});

new Base();

module.exports = Base;

//var Base = function(that){
//  that = that || this || {};
//
//  that.system = {
//    isDebugging: true,
//    log: function(){
//      return that.system.isDebugging && (console.log.apply(console, arguments));
//    }
//  };
//
//  /**
//   * Interface
//   */
//  that.ui = _.extend({
//    head: $("head"),
//    body: $("body"),
//    footer: $("footer")
//  }, that.ui || {});
//
//  that.data = {
//    dataTable: {
//      options: {
//        processing: true,
//        lengthChange: false,
//        searching: false,
//        serverSide: true,
//        stateSave: true
//      }
//    }
//  };
//
//  /**
//   * Initialization
//   * @returns {Base}
//   */
//  that.init = function(){
//    that.system.log("base.init()");
//
//    var HelloMessage = React.createClass({
//      render: function(){
//        return React.createElement("div", null, "Hello, ", this.props.name);
//      }
//    });
//
//    ReactDOM.render(React.createElement(HelloMessage, { name: "React" }), document.getElementById("body"));
//
//    return that;
//  };
//
//  return that.init();
//};
//
//module.exports = Base;