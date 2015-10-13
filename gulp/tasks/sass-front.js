"use strict";

var sass = require("gulp-sass");

module.exports = function(gulp, path){
  return function(){
    return gulp.src(path.front.scss.src)
      .pipe(sass({
        outputStyle: "compressed"
      })
        .on("error", sass.logError))
      .pipe(gulp.dest(path.front.scss.dest));
  };
};