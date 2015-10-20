"use strict";

var Base = require("app/views/base");

module.exports = Base.extend({
  className: "home_index_view",
  render: function(){
    console.log("home/index");
  }
});
module.exports.id = "home/index";