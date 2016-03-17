"use strict";

const WORDFORM = {
  POS: {
    NOUN: "n",
    VERB: "v",
    ADJECTIVE: "a",
    ADJECTIVE_SATELLITE: "s",
    ADVERB: "r"
  },
  CASE: {
    NOMINATIVE: "n",
    GENITIVE: "g",
    DATIVE: "d",
    ACCUSATIVE: "a",
    INSTRUMENTAL: "i",
    LOCATIVE: "l",
    VOCATIVE: "v"
  },
  GENDER: {
    MASCULINE: "m",
    FEMININE: "f",
    NEUER: "n"
  },
  PLURALITY: {
    SINGLE: "s",
    PLURAL: "p"
  },
  COMPARISON: {
    POSITIVE: "p",
    COMPARATIVE: "c",
    SUPERLATIVE: "s"
  },
  TENSE: {
    FUTURE: "ftr",
    PRESENT: "prs",
    PAST: "pst",
    PAST_PERFECT: "psp"
  },
  PERSON: {
    FIRST: 0,
    SECOND: 1,
    THIRD: 2
  }
};

module.exports = WORDFORM;