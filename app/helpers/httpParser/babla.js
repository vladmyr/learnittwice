"use strict";

var _ = require("underscore");
var Promise = require("bluebird");
var stream = require("stream");
var cheerio = require("cheerio");
var url = require("url");
var path = require("path");

/**
 * Parse data from babla website: https://bab.la/
 * @returns {{getInstance: Function}}
 */
var Babla = function(app, args){
  var instance;

  /**
   * @contructor
   * @returns {{getProtocol: Function, getDomain: Function, getLangs: Function, action: {parsePage: Function}}}
   */
  var init = function(){
    var PROTOCOL = "http";
    var HOSTNAME = "pl.bab.la";
    var LANGS = {
      url: {
        pl: "polski",
        en: "angielski"
      },
      normalized: {
        polski: app.const.LANGUAGE.POLISH,
        angielski: app.const.LANGUAGE.ENGLISH
      }
    };
    var downloadDir = path.join(app.root_dir, (args.downloadDir || "/public/audio/glosbe"));

    var generateUrlObject = function(replacement){
      var urlTranslatePathname = "/slownik/:from-:to/:word";
      var urlObject = null;

      if(replacement){
        if(replacement.from && replacement.to && replacement.word) {
          var from = LANGS.url[replacement.from];
          var to = LANGS.url[replacement.to];

          urlObject = {
            slashes: true,
            protocol: PROTOCOL,
            hostname: HOSTNAME,
            pathname: urlTranslatePathname
              .replace(":from", from)
              .replace(":to", to)
              .replace(":word", replacement.word)
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
    var extractTranslationItem = function($doc){
      var $elAudio = $doc("audio");
      var $elTranslations = $doc(".result-right");
      var translationItems = [];

      _.each($elTranslations, function($item){
        var language;
        var word;

        //parse language
        if($item
          && $item.children
          && $item.children[1]
          && $item.children[1].attribs
          && $item.children[1].attribs.lang){
          language = $item.children[1].attribs.lang;
        }

        //parse word
        if($item
          && $item.children
          && $item.children[1]
          && $item.children[1].children
          && $item.children[1].children[0]
          && $item.children[1].children[0].children
          && $item.children[1].children[0].children[0]
          && $item.children[1].children[0].children[0].data){
          word = $item.children[1].children[0].children[0].data
        }

        if(language && word){
          var item = {
            language: $item.children[1].attribs.lang,
            word: $item.children[1].children[0].children[0].data,
            audio: []
          };

          //parse audio file
          _.each($item.children[1].children, function($span){
            if($span.name === "span"){
              if($span.children
                && $span.children[0]
                && $span.children[0].attribs
                && $span.children[0].attribs["data-url-mp3"]){
                item.audio.push($span.children[0].attribs["data-url-mp3"]);
              }
            }
          });

          translationItems.push(item);
        }
      });

      return translationItems;
    };

    var downloadAudio = function(translationItems){
      var promise = Promise.resolve();

      _.each(translationItems, function(item){
        var dir = path.join(downloadDir, item.language, item.word);

        _.each(item.audio, function(audio, index){
          promise = generateUrlObject({
            audio: audio
          }).then(function(urlAddress){
            return app.helpers.utils.fs.mkdir(dir)
              .then(app.helpers.utils.net.pipeIntoFile(urlAddress, path.join(dir, Number(index).toString() + path.extname(audio))));
          })
        });
      });

      return promise;
    };

    return {
      generateUrlObject: generateUrlObject,
      getLanguages: function(){
        return LANGS.url;
      },
      parseUrl: parseUrl,
      extractTranslationItem: extractTranslationItem,
      downloadAudio: downloadAudio
    }
  };

  return {
    getInstance: function(){
      !instance && (instance = init());
      return instance;
    }
  }
};

module.exports = Babla;