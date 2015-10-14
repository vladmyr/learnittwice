"use strict";

console.log("scene.js");

var FamousEngine = require("famous/core/FamousEngine");
var DOMElement = require("famous/dom-renderables/DOMElement");

FamousEngine.init();

var scene = FamousEngine.createScene();
var logo = scene.addChild();

new DOMElement(logo, { tagName: "img" })
  .setAttribute("src", "/img/icon/famous_logo.png");

logo
  .setSizeMode("absolute", "absolute", "absolute")
  .setAbsoluteSize(250, 250)
  .setAlign(0.5, 0.5)
  .setMountPoint(0.5, 0.5)
  .setOrigin(0.5, 0.5);

var spinner = logo.addComponent({
  onUpdate: function(time){
    logo.setRotation(0, time / 1000, 0);
    logo.requestUpdateOnNextTick(spinner);
  }
});

logo.requestUpdate(spinner);