import assert from 'node:assert';
import har from '../../help/har.js';

describe('Use favicon', function() {
  it('We should be able to know if we have a favicon', function() {
    return har.firstAdviceForTestFile('favicon.har').then(result => {
      assert.strictEqual(result.performance.adviceList.favicon.score, 100);
    });
  });
});
