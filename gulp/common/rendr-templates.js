"use strict";

var path = require("path");
var jade = require("gulp-jade");
var concatJst = require("./gulp-jade-jst-concat");

var compileRendrTemplates = function(gulp, pth, src, dest, basepath, concatName){
  return function(){
    return gulp.src(src)
      .pipe(jade({
        client: true
      }))
      .pipe(concatJst(concatName, {
        basepath: basepath
      }))
      .pipe(gulp.dest(dest));
  };
};

module.exports = {
  compileRendrTemplates: compileRendrTemplates
};