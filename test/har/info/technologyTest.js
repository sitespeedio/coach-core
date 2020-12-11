'use strict';

let assert = require('assert');
let har = require('../../help/har');

describe('Check for technology', function() {
  it('We shave the right amount', function() {
    return har.firstAdviceForTestFile('withHtmlContent.har').then(result => {
      assert.strictEqual(
        result.info.technology.length,
        7
      );
    });
  });

});
