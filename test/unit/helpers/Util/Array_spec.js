'use strict'

const expect = require('chai').expect;
const Array = require('../../../../unitTest.js').Util2.Array;

describe('Array', () => {
  describe('#chuck', () => {
    it('slices array into array of chunks', () => {
      expect(Array.chunk([0, 1, 2, 3, 4, 5], 0)).to.deep.equal([[0, 1, 2, 3, 4, 5]]);
      expect(Array.chunk([0, 1, 2, 3, 4, 5], 1)).to.deep.equal([[0], [1], [2], [3], [4], [5]]);
      expect(Array.chunk([0, 1, 2, 3, 4, 5], 2)).to.deep.equal([[0, 1], [2, 3], [4, 5]]);
    })
  });
});