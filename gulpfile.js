"use strict";

var gulp = require("./gulp")(__dirname);

gulp.task("sass", ["sass-front", "sass-admin"]);
gulp.task("img", ["img-front"]);
gulp.task("browserify", ["browserify-front", "browserify-admin"]);
gulp.task("build", ["sass", "img", "browserify"]);
gulp.task("default", ["build"]);