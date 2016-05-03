'use strict';

class String {
  /**
   * Match all regex occurrences in string
   * @param string
   * @param regexp
   */
  static matchAll (string, regexp) {
    let matches = [];

    string.replace(regexp, () => {
      let arr = [].slice.call(arguments, 0);
      let extras = arr.slice(-2);
      arr.index = extras[0];
      arr.input = extras[1];
      matches.push(arr);
    });

    return matches;
  }
}

module.exports = String;