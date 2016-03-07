"use strict";

const Promise = require("bluebird");

/**
 * Populate languages collection
 * @param app
 */
const populateLanguages = (app) => {
  const languages = [{
    _id: app.LANGUAGE.ENGLISH,
    alphabet: [
      { letter: "a", count: 0 },
      { letter: "b", count: 0 },
      { letter: "c", count: 0 },
      { letter: "d", count: 0 },
      { letter: "e", count: 0 },
      { letter: "f", count: 0 },
      { letter: "g", count: 0 },
      { letter: "h", count: 0 },
      { letter: "i", count: 0 },
      { letter: "j", count: 0 },
      { letter: "k", count: 0 },
      { letter: "l", count: 0 },
      { letter: "m", count: 0 },
      { letter: "n", count: 0 },
      { letter: "o", count: 0 },
      { letter: "p", count: 0 },
      { letter: "q", count: 0 },
      { letter: "r", count: 0 },
      { letter: "s", count: 0 },
      { letter: "t", count: 0 },
      { letter: "u", count: 0 },
      { letter: "v", count: 0 },
      { letter: "w", count: 0 },
      { letter: "x", count: 0 },
      { letter: "y", count: 0 },
      { letter: "z", count: 0 }
    ]
  }, {
    _id: app.LANGUAGE.POLISH,
    alphabet: [
      { letter: "a", count: 0 },
      { letter: "ą", count: 0 },
      { letter: "b", count: 0 },
      { letter: "c", count: 0 },
      { letter: "ć", count: 0 },
      { letter: "d", count: 0 },
      { letter: "e", count: 0 },
      { letter: "ę", count: 0 },
      { letter: "f", count: 0 },
      { letter: "g", count: 0 },
      { letter: "h", count: 0 },
      { letter: "i", count: 0 },
      { letter: "j", count: 0 },
      { letter: "k", count: 0 },
      { letter: "l", count: 0 },
      { letter: "ł", count: 0 },
      { letter: "m", count: 0 },
      { letter: "n", count: 0 },
      { letter: "ń", count: 0 },
      { letter: "o", count: 0 },
      { letter: "ó", count: 0 },
      { letter: "p", count: 0 },
      { letter: "r", count: 0 },
      { letter: "s", count: 0 },
      { letter: "ś", count: 0 },
      { letter: "t", count: 0 },
      { letter: "u", count: 0 },
      { letter: "w", count: 0 },
      { letter: "y", count: 0 },
      { letter: "z", count: 0 },
      { letter: "ź", count: 0 },
      { letter: "ż", count: 0 }
    ]
  }, {
    _id: app.LANGUAGE.UKRAINIAN,
    alphabet: [
      { letter: "а", count: 0 },
      { letter: "б", count: 0 },
      { letter: "в", count: 0 },
      { letter: "г", count: 0 },
      { letter: "ґ", count: 0 },
      { letter: "д", count: 0 },
      { letter: "е", count: 0 },
      { letter: "є", count: 0 },
      { letter: "ж", count: 0 },
      { letter: "з", count: 0 },
      { letter: "и", count: 0 },
      { letter: "і", count: 0 },
      { letter: "ї", count: 0 },
      { letter: "й", count: 0 },
      { letter: "к", count: 0 },
      { letter: "л", count: 0 },
      { letter: "м", count: 0 },
      { letter: "н", count: 0 },
      { letter: "о", count: 0 },
      { letter: "п", count: 0 },
      { letter: "р", count: 0 },
      { letter: "с", count: 0 },
      { letter: "т", count: 0 },
      { letter: "у", count: 0 },
      { letter: "ф", count: 0 },
      { letter: "х", count: 0 },
      { letter: "ц", count: 0 },
      { letter: "ч", count: 0 },
      { letter: "ш", count: 0 },
      { letter: "щ", count: 0 },
      { letter: "ь", count: 0 },
      { letter: "ю", count: 0 },
      { letter: "я", count: 0 }
    ]
  }];

  return Promise.each(languages, (item) => {
    return new app.modelsMongo.Language(item).save();
  });
};

module.exports = (app) => {
  return Promise.resolve().then(() => {
    return populateLanguages(app);
  })
};

