'use strict';

const path = require("path");
const config = require("config");
const App = require(path.join(__dirname, config.file.app));

config.dir.root = __dirname;

let app = new App(config);

module.exports = app;