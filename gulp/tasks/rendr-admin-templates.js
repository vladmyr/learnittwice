"use strict";

module.exports = function(gulp, path) {
  return require(path.common.rendrTemplates).compileRendrTemplates(gulp,
    path,
    [path.admin.jade.src, "!" + path.admin.jade.srcLayout],
    path.admin.jade.dest,
    path.admin.jade.basepath,
    path.admin.jade.destName);
};