'use strict';

const _ = require('underscore');
const Promise = require('bluebird');
const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');

class Net {
  /**
   * Pipe data from internet
   * @param urlAddress
   * @param writable
   * @param options
   * @returns {Promise}
   */
  static pipe (urlAddress, writable, options) {
    return new Promise(function(fulfill, reject){
      options = _.extend({
        onResponseRedirect: true
      }, options);

      if(!writable){
        return reject(new Error('No writable stream was passed'));
      }

      var urlObject = (typeof urlAddress === 'string' ? url.parse(urlAddress) : urlAddress);

      (urlObject.protocol === 'http' ? http : https).get(encodeURI(url.format(urlObject)), function (res) {
        if(res.statusCode === 404){
          res.pipe(writable);
        }else if(res.statusCode === 302){
          if(options.onResponseRedirect){
            var redirect = url.parse(res.headers.location);

            !!redirect.protocol && redirect.protocol !== '' && (urlObject.protocol = redirect.protocol);
            !!redirect.hostname && redirect.hostname !== '' && (urlObject.hostname = redirect.hostname);

            urlObject.pathname = url.parse(res.headers.location).pathname;

            (urlObject.protocol === 'http' ? http : https).get(url.format(urlObject), function (res) {
              res.pipe(writable);
            });
          }else{
            res.pipe(writable);
          }
        }else{
          res.pipe(writable);
        }

        res.on('end', function(){
          return fulfill();
        });

      }).on('error', function(err){
        return Promise.reject(err);
      });
    });
  }

  /**
   * Pipe data from internet into local file
   * @param urlAddress
   * @param filename
   */
  static pipeIntoFile (urlAddress, filename) {
    return Promise.resolve().then(function(){
      return new Promise(function(fulfill, reject){
        var fileStream = fs.createWriteStream(filename);

        fileStream.on('finish', function(){
          return fulfill();
        });
        fileStream.on('error', function(err){
          return reject(err);
        });

        Net.pipe(urlAddress, fileStream);
      })
    })
  }
}

module.exports = Net;