"use strict";

var browserify = require("browserify");
var uglify = require("gulp-uglify");
var tap = require("gulp-tap");
var buffer = require("gulp-buffer");
var globby = require("globby");
var through = require("through2");
var reactify = require("reactify");
var source = require("vinyl-source-stream");

module.exports = function(gulp, path){
  return function(){
    var bundledStream = through();

    bundledStream
      .pipe(source("bundle.js"))
      //.pipe(buffer())
      //.pipe(uglify())
      .pipe(gulp.dest(path.front.js.dest));

    globby([path.front.js.src]).then(function(entries){
      return browserify({
        entries: entries,
        debug: true,
        transform: [reactify]
      }).bundle().pipe(bundledStream);
    })
  }
};