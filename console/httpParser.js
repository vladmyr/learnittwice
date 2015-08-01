"use strict";

var http = require("http"),
    https = require("https");

https.get("https://uk.glosbe.com/pl/uk/przypomina%C4%87", function(res){
  //console.log(res);
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
}).on("error", function(e){
  console.log("Error:", e.message);
});

//var options = {
//  hostname: 'www.google.com',
//  port: 80,
//  path: '/',
//  method: 'GET',
//  headers: {
//    //'Content-Type': 'text/plain',
//    //'Content-Length': '0'
//  }
//};
//
//var req = http.request(options, function(res) {
//  console.log('STATUS: ' + res.statusCode);
//  console.log('HEADERS: ' + JSON.stringify(res.headers));
//  res.setEncoding('utf8');
//  res.on('data', function (chunk) {
//    console.log('BODY: ' + chunk);
//  });
//});
//
//req.on('error', function(e) {
//  console.log('problem with request: ' + e.message);
//});
//
//req.end();