"use strict";

var Lemma = require("app/models/Lemma");

var Lemmas = Backbone.Collection.extend({
  model: Lemma
});

module.exports = Lemmas;
