// https://github.com/agsh/gulp-jade-jst-concat

var gUtil = require('gulp-util');
var PluginError = gUtil.PluginError;
var File = gUtil.File;
var through = require('through');
var extend = require('util')._extend;
var path = require("path");

/*
 * Takes the output from gulp-jade and transforms the names of the functions and
 * concatinates json data files and returns a string with all template data
 *
 */

function pluginError (message) {
  return new PluginError('gulp-jade-jst-concat', message);
}

var normalizeBasename = function(pth, dirName){
  var index = pth.lastIndexOf(dirName);

  if(index !== -1){
    console.log(dirName.length);

    pth = pth.substr(index, dirName.length - 1);
  }

  console.log(pth);

  return pth.split(path.sep).join("/");
};

module.exports = function processFiles(fileName, _opts) {
  if (!fileName) throw pluginError('Missing fileName');

  var defaults = {
      srcDir: "",
      basepath: path.dirname(fileName),
      globals: {}
    },
    opts = extend(defaults, _opts),
    data = {};

  function write (file) {
    if (file.isNull()) return;
    if (file.isStream()) return this.emit('error', pluginError('Streaming not supported'));

    //do stuff
    var basename = path.normalize(path.relative(opts.basepath, file.path).split(".js")[0]).split(path.sep).join("/");
    // Change the function name to the basename for the template
    file.contents = new Buffer(file.contents.toString().replace("function template", "\"" + basename + "\": function"));
    data[basename] = file.contents;
  }

  function end () {
    var concatedData = "var jade = require('jade/runtime');\n";
    Object.keys(opts.globals).forEach(function(name) {
      concatedData += "var " + name + " = require('" + opts.globals[name] + "');\n"
    });
    concatedData += "module.exports = {\n";
    concatedData += Object.keys(data).map(function(name) { return data[name].toString(); }).join(",\n");
    concatedData += "};\n";

    this.queue(new File({
      path: fileName,
      contents: new Buffer(concatedData)
    }));

    this.queue(null);
  }

  return through(write, end);
};