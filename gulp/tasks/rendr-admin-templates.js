"use strict";

module.exports = function(gulp, path) {
  return function(){
    return require(path.common.rendrTemplates).compileRendrTemplates(gulp,
      path,
      [path.admin.jade.src, "!" + path.admin.jade.srcLayout],
      path.admin.jade.dest);
  };
};