'use strict';

const _ = require('underscore');
const config = require('config');
const http = require('http');
const Promise = require('bluebird');
const path = require('path');

const global = require('./global');

/**
 * Server main initialization
 */
let app;

return global(config).then(() => {
  const App = alias.require('@file.app');
  app = new App(config);

  return app.initialize();
}).then(function(){
  // setup web servers for each entry point
  return Promise.each(app.expressApps, function(expressApp) {
    return new Promise(function (fulfill, reject) {
      // TODO - implement https protocol for different environments
      return http.createServer(expressApp).listen(expressApp.get('port'), function (err) {
        if (err) {
          return reject(err);
        } else {
          console.log('Listening "' + expressApp.get('alias') + '" on port', expressApp.get('port'));
          return fulfill();
        }
      });
    });
  }, { concurrency: 1 });
})
//  .catch(function(err){
//  // error handling
//  // TODO - implement decent error handling with logging
//  console.log(err, err.stack
//    ? JSON.parse(err.stack)
//    : '');
//  return process.exit(0);
//});