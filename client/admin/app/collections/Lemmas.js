"use strict";

var Lemma = require("../models/Lemma");

var Lemmas = Backbone.Collection.extend({
  model: Lemma
});

module.exports = Lemmas;
