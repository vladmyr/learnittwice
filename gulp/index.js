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
        src: path.join(assetsDir, "front/scss/**/*.scss"),
        dest: path.join(appDir, "public/front/css/")
      },
      js: {
        src: path.join(assetsDir, "front/js/**/*.js"),
        dest: path.join(appDir, "public/front/js/")
      },
      img: {
        src: path.join(assetsDir, "front/img/**/*"),
        dest: path.join(appDir, "public/front/img/")
      }
    }
  };

  utils.fs.scanDirSync(tasksDir, {}, function(file){
    gulp.task(path.basename(file, path.extname(file)), require(path.join(tasksDir, file))(gulp, pth));
  });
  return gulp;
};