'use strict';

const expect = require('chai').expect;
const Typecast = require('../../../../unitTest.js').Util.Typecast;

describe('Typecast', () => {
  describe('#number', () => {
    it('Casts Number itself', () => {
      expect(Typecast.number(2)).to.equal(2);
      expect(Typecast.number(Number(2))).to.equal(2);
    });

    it('Casts string with valid number', () => {
      expect(Typecast.number('12')).to.equal(12);
      expect(Typecast.number('0223')).to.equal(223);
      expect(Typecast.number('-123')).to.equal(-123);
      expect(Typecast.number('-00')).to.equal(0);
    });

    it('Casts string with non valid number to 0', () => {
      expect(Typecast.number('null')).to.equal(0);
      expect(Typecast.number('-++')).to.equal(0);
      expect(Typecast.number('wasd')).to.equal(0);
      expect(Typecast.number('0ww1sd')).to.equal(0);
    });

    it('Casts Boolean', () => {
      expect(Typecast.number(true)).to.equal(1);
      expect(Typecast.number(false)).to.equal(0);
    });

    it('Casts Object to 0', () => {
      expect(Typecast.number({})).to.equal(0);
      expect(Typecast.number({ foo: 'bar' })).to.equal(0);
    });
  });
});