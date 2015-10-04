"use strict";

var path = require("path");
var gulp = require("gulp");

var utils = require("../app/helpers/utils");

module.exports = function(root){
  var tasksDir = path.join(root, "gulp/tasks");
  var appDir = path.join(root, "app");
  var assetsDir = path.join(root, "assets");
  var tmpDir = path.join(root, "tmp");

  var pth = {
    front: {
      scss: {
        src: path.join(assetsDir, "scss/front/**/*.scss"),
        dest: path.join(appDir, "public/css/front/")
      },
      js: {
        src: path.join(assetsDir, "js/front/**/*.js"),
        dest: path.join(appDir, "public/js/front/")
      }
    }
  };

  utils.fs.scanDirSync(tasksDir, { excludes: [ /*"browserify"*/ ] }, function(file){
    gulp.task(path.basename(file, path.extname(file)), require(path.join(tasksDir, file))(gulp, pth));
  });
  return gulp;
};