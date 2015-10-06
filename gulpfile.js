"use strict";

var gulp = require("./gulp")(__dirname);

gulp.task("build", ["sass-front", "img-front", "browserify"]);
gulp.task("default", ["build"]);