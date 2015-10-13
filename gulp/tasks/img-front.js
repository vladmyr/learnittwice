"use strict";

var imagemin = require("gulp-imagemin");
var optipng = require("imagemin-optipng");
var jpegtran = require("imagemin-jpegtran");

module.exports = function(gulp, path){
  return function(){
    return gulp.src(path.front.img.src)
      .pipe(imagemin({
        progressive: true,
        optimisationLevel: 3,
        use: [optipng(), jpegtran()]
      }))
      .pipe(gulp.dest(path.front.img.dest));
  };
};