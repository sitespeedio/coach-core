import assert from 'node:assert';
import har from '../../help/har.js';

describe('Check for technology', function() {
  it('We shave the right amount of technologies', function() {
    return har.firstAdviceForTestFile('withHtmlContent.har').then(result => {
      assert.strictEqual(
        result.info.technology.length,
        7
      );
    });
  });

});
