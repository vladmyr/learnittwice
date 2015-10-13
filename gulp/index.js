"use strict";

var path = require("path");
var gulp = require("gulp");

var utils = require("../app/helpers/utils");

module.exports = function(root){
  var tasksDir = path.join(root, "gulp/tasks");
  var appDir = path.join(root, "app");
  var assetsClientDir = path.join(root, "assets", "client");
  var tmpDir = path.join(root, "tmp");

  var pth = {
    front: {
      scss: {
        src: path.join(assetsClientDir, "front/scss/**/*.scss"),
        dest: path.join(appDir, "public/front/css/")
      },
      js: {
        src: path.join(assetsClientDir, "front/js/**/*.js"),
        dest: path.join(appDir, "public/front/js/")
      },
      img: {
        src: path.join(assetsClientDir, "front/img/**/*"),
        dest: path.join(appDir, "public/front/img/")
      }
    },
    admin: {
      scss: {
        src: path.join(assetsClientDir, "admin/scss/**/*.scss"),
        dest: path.join(appDir, "public/admin/css/")
      },
      js: {
        src: path.join(assetsClientDir, "admin/js/**/*.js"),
        dest: path.join(appDir, "public/admin/js/")
      },
      img: {
        src: path.join(assetsClientDir, "admin/img/**/*"),
        dest: path.join(appDir, "public/admin/img/")
      }
    }
  };

  utils.fs.scanDirSync(tasksDir, {}, function(file){
    gulp.task(path.basename(file, path.extname(file)), require(path.join(tasksDir, file))(gulp, pth));
  });
  return gulp;
};
