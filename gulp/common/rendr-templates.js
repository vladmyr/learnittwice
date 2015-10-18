"use strict";

var jade = require("gulp-jade");

var compileRendrTemplates = function(gulp, path, src, dest){
  return gulp.src(src)
    .pipe(jade({
      client: true
    }))
    .pipe(gulp.dest(dest));
};

module.exports = {
  compileRendrTemplates: compileRendrTemplates
};