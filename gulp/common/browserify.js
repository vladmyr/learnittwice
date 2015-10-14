"use strict";

var pathModule = require("path");
var browserify = require("browserify");
var uglify = require("gulp-uglify");
var tap = require("gulp-tap");
var buffer = require("gulp-buffer");
var globby = require("globby");
var through = require("through2");
var source = require("vinyl-source-stream");
var glob = require("glob");
var plumber = require("gulp-plumber");

var browserifyTask = function(gulp, path, src, dest){
  var bundledStream = through();

  bundledStream
    .pipe(source("bundle.js"))
    //.pipe(buffer())
    //.pipe(uglify())
    .pipe(gulp.dest(dest));

  globby([src]).then(function(entries){
    return browserify({
      entries: entries,
      debug: true
    }).bundle().pipe(bundledStream);
  })
};

var browserifyRendrTask = function(gulp, path, src, dest){
  var bundledStream = through();

  bundledStream
    .pipe(source("bundle.js"))
    //.pipe(buffer())
    //.pipe(uglify())
    .pipe(gulp.dest(dest));

  var normalizePath = function(path, dirName){
    !dirName && (dirName = "app/");
    var index = path.lastIndexOf(dirName);

    path = path.replace(/.js$/, "");

    if(index === -1){
      return path;
    }else{
      return path.substr(index, path.length - 1);
    }
  };

  var rendrClientFiles = glob.sync("rendr/{client,shared}/**/*.js", {
    cwd: path.nodeModulesDir
  });

  var rendrModules = rendrClientFiles.map(function(file){
    return file.replace(".js", "");
  });

  var getBundler = function(globs){
    var bundler =  browserify({
      debug: true,
      entries: []
    });
    var files;

    globs.forEach(function(pattern){
      files = glob.sync(pattern, { cwd: path.root });
      files.forEach(function(file){
        var expose = normalizePath(file);
        bundler.require(file, { expose: expose });
      });
    });

    rendrModules.forEach(function(moduleName){
      bundler.require(moduleName);
    });

    bundler.require("jquery", { expose: "jquery" });

    return bundler;
  };

  var bundler = getBundler([src]);

  bundler.bundle()
    .pipe(plumber())
    .pipe(bundledStream);
};

module.exports = {
  browserifyTask: browserifyTask,
  browserifyRendrTask: browserifyRendrTask
};
