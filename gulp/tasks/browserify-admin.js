"use strict";

module.exports = function(gulp, path){
  return require(path.common.browserify).browserifyRendrTask(gulp, path, path.admin.js.src, path.admin.js.dest);
  //return require(path.common.browserify).browserifyTask(gulp, path, path.admin.js.src, path.admin.js.dest);
};
