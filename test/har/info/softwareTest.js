'use strict';

let assert = require('assert');
let har = require('../../help/har');

describe('Check for software', function() {
  it('We shave the rright amoung of software', function() {
    return har.firstAdviceForTestFile('withHtmlContent.har').then(result => {
      assert.strictEqual(
        result.info.software.length,
        5
      );
    });
  });

});
