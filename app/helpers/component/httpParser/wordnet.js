"use strict";

var LANGUAGES = require("../../../domain/Language");

var _ = require("underscore");
var Promise = require("bluebird");
var stream = require("stream");
var cheerio = require("cheerio");
var url = require("url");
var path = require("path");

/**
 * Parse data from glosbe website: https://glosbe.com/
 * @returns {{getInstance: Function}}
 */
var Wordnet = function(app, args){
  var instance;

  /**
   * @contructor
   * @returns {{getProtocol: Function, getDomain: Function, getLangs: Function, action: {parsePage: Function}}}
   */
  var init = function(){
    var PROTOCOL = "http";
    var HOSTNAME = "wordnet-rdf.princeton.edu";

    var generateUrlObject = function(replacement){
      var urlLemmaPathname = "/:wn/:synsetId-:pos";
      var urlObject = null;

      if(replacement){
        if(replacement.wn && replacement.synsetId && replacement.pos) {
          urlObject = {
            slashes: true,
            protocol: PROTOCOL,
            hostname: HOSTNAME,
            pathname: urlLemmaPathname
              .replace(":wn", replacement.wn)
              .replace(":synsetId", replacement.synsetId)
              .replace(":pos", replacement.pos)
          };
        }
      }

      return Promise.props(urlObject);
    };

    /**
     * Parse page by given address
     * @param urlAddress
     * @returns {bluebird}
     */
    var parseUrl = function(urlAddress){
      return new Promise(function(fulfill, reject){
        var writable = new stream.Writable();
        var data;

        writable._write = function(chunk, enc, callback){
          !data ? (data = chunk.toString()) : (data += chunk.toString());
          callback();
        };

        writable.on("finish", function(){
          fulfill(cheerio.load(data));
        });
        writable.on("error", function(err){
          console.log("err: ", err);
          reject(err);
        });

        app.helpers.utils.net.pipe(urlAddress, writable);
      });
    };

    /**
     * Extract translation items from parsed page
     * @param $doc  - parsed url page
     * @returns {Array}
     */
    var extractLemmaInfo = function($doc){
      var $el = $doc(".body");
      var lemmaInfo = [];

      _.each($el, function($item){
        //ToDo: finish extracting function
        var item = $item;
        //var language;
        //var word;
        //
        ////parse language
        //if($item
        //  && $item.children
        //  && $item.children[1]
        //  && $item.children[1].attribs
        //  && $item.children[1].attribs.lang){
        //  //normalise language
        //  language = LANGS.normalized[[$item.children[1].attribs.lang]];
        //}
        //
        ////parse word
        //if($item
        //  && $item.children
        //  && $item.children[1]
        //  && $item.children[1].children
        //  && $item.children[1].children[0]
        //  && $item.children[1].children[0].children
        //  && $item.children[1].children[0].children[0]
        //  && $item.children[1].children[0].children[0].data){
        //  word = $item.children[1].children[0].children[0].data
        //}
        //
        //if(language && word){
        //  var item = {
        //    language: $item.children[1].attribs.lang,
        //    word: $item.children[1].children[0].children[0].data,
        //    audio: []
        //  };
        //}
      });

      return lemmaInfo;
    };

    return {
      generateUrlObject: generateUrlObject,
      parseUrl: parseUrl,
      extractLemmaInfo: extractLemmaInfo
    }
  };

  return {
    getInstance: function(){
      !instance && (instance = init());
      return instance;
    }
  }
};

module.exports = Wordnet;