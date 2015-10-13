"use strict";

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
var Glosbe = function(app, args){
  var instance;

  /**
   * @contructor
   * @returns {{getProtocol: Function, getDomain: Function, getLangs: Function, action: {parsePage: Function}}}
   */
  var init = function(){
    var PROTOCOL = "https";
    var HOSTNAME = "glosbe.com";
    var LANGS = {
      url: {
        uk: "uk",
        pl: "pl",
        gb: "en"
      },
      normalized: {
        uk: app.const.LANGUAGE.UKRAINIAN,
        pl: app.const.LANGUAGE.POLISH,
        en: app.const.LANGUAGE.ENGLISH
      }
    };
    var downloadDir = path.join(app.root_dir, (args.downloadDir || "/public/audio/glosbe"));

    var generateUrlObject = function(replacement){
      var urlTranslatePathname = "/:from/:to/:word";
      var urlAudioPathname = ":audio";
      var urlApiTranslatePathname = "/gapi/translate";
      var urlApiTranslateSearch = "from=:from&dest=:to&format=:format&phrase=:word";
      var urlObject = null;

      if(replacement){
        if(replacement.from && replacement.to && replacement.format && replacement.word) {
          var from = LANGS.url[replacement.from];
          var to = LANGS.url[replacement.to];

          urlObject = {
            slashes: true,
            protocol: PROTOCOL,
            hostname: HOSTNAME,
            pathname: urlApiTranslatePathname,
            search: urlApiTranslateSearch
              .replace(":from", from)
              .replace(":to", to)
              .replace(":format", replacement.format)
              .replace(":word", replacement.word)
          };
        }else if(replacement.from && replacement.to && replacement.word) {
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
        }else if(replacement.audio){
          urlObject = {
            slashes: true,
            protocol: PROTOCOL,
            hostname: HOSTNAME,
            pathname: urlAudioPathname
              .replace(":audio", replacement.audio)
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
    var parseUrl = function(urlAddress, options){
      return new Promise(function(fulfill, reject){
        var writable = new stream.Writable();
        var data;

        options = _.extend({
          raw: false
        }, options);

        writable._write = function(chunk, enc, callback){
          !data ? (data = chunk.toString()) : (data += chunk.toString());
          callback();
        };

        writable.on("finish", function(){
          fulfill(options.raw ? data : cheerio.load(data));
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
      var $el = $doc("[data-translation-id]");
      var translationItems = [];

      _.each($el, function($item){
        var language;
        var word;

        //parse language
        if($item
          && $item.children
          && $item.children[1]
          && $item.children[1].attribs
          && $item.children[1].attribs.lang){
          //normalise language
          language = LANGS.normalized[[$item.children[1].attribs.lang]];
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

    var api = (function(){
      return {
        translate: function(parameters){
          return generateUrlObject(_.extend(parameters, { format: "json" })).then(function(urlObject){
            return parseUrl(urlObject, { raw: true });
          }).then(function(json){
            return JSON.parse(json);
          }).catch(function(err){
            return Promise.reject(err);
          });
        }
      }
    })();

    return {
      generateUrlObject: generateUrlObject,
      getLanguages: function(){
        return LANGS.url;
      },
      parseUrl: parseUrl,
      extractTranslationItem: extractTranslationItem,
      downloadAudio: downloadAudio,
      api: api
    }
  };

  return {
    getInstance: function(){
      !instance && (instance = init());
      return instance;
    }
  }
};

module.exports = Glosbe;