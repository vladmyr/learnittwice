"use strict";

var browserify = require("browserify");
var uglify = require("gulp-uglify");
var plumber = require("gulp-plumber");
var tap = require("gulp-tap");
var buffer = require("gulp-buffer");


module.exports = function(gulp, path){
  return function(){
    var b;

    function bundler(file) {
      if (!b) {
        b = browserify({
          entries: file.path
        });
      }
      var stream = b.bundle();
      file.contents = stream;
    }

    gulp.src(path.front.js.src, {read: false})
      .pipe(plumber())
      .pipe(tap(bundler))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(gulp.dest(path.front.js.dest));
  }
};