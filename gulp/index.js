"use strict";

var path = require("path");
var gulp = require("gulp");

var utils = require("../app/helpers/utils");

module.exports = function(root){
  var commonDir = path.join(root, "gulp/common");
  var tasksDir = path.join(root, "gulp/tasks");
  var appDir = path.join(root, "app");
  var clientDir = path.join(root, "client");
  var nodeModulesDir = path.join(root, "node_modules");

  var pth = {
    root: root,
    nodeModulesDir: nodeModulesDir,
    common: {
      browserify: path.join(commonDir, "browserify")
    },
    front: {
      scss: {
        src: path.join(clientDir, "front/assets/scss/**/*.scss"),
        dest: path.join(clientDir, "front/app/public/css/")
      },
      js: {
        src: path.join(clientDir, "front/app/**/*.js"),
        dest: path.join(clientDir, "front/app/public/js/")
      },
      img: {
        src: path.join(clientDir, "front/assets/img/**/*"),
        dest: path.join(clientDir, "front/app/public/img/")
      }
    },
    admin: {
      scss: {
        src: path.join(clientDir, "admin/assets/scss/**/*.scss"),
        dest: path.join(clientDir, "admin/app/public/css/")
      },
      js: {
        src: path.join(clientDir, "admin/app/**/*.js"),
        dest: path.join(clientDir, "admin/app/public/js/")
      },
      img: {
        src: path.join(clientDir, "admin/assets/img/**/*"),
        dest: path.join(clientDir, "admin/app/public/img/")
      }
    }
  };

  utils.fs.scanDirSync(tasksDir, {}, function(file){
    gulp.task(path.basename(file, path.extname(file)), require(path.join(tasksDir, file))(gulp, pth));
  });
  return gulp;
};
