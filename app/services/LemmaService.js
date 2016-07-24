'use strict';

const Promise = require('bluebird');

class LemmaService {
  constructor(app) {
    this.app = app;
  }

  list (offset = 0, limit = 20) {
    return this.app.models.Lemma.findAll({ offset, limit });
  }

  findOneById (id) {
    const Lemma = this.app.models.Lemma;

    return Promise
      .resolve()
      .then(() => {
        return Lemma
          .findOneById(id)
          .populate(Lemma.POPULATION.SYNSET)
      })
      .then((lemma) => {
        if (!lemma) return lemma;

        return lemma.populateSynonyms();
      });
  }
}

module.exports = LemmaService;
