import assert from 'node:assert';
import har from '../../help/har.js';

describe('Investigate many response headers', function() {
  it('We should be able to find responses with really many headers', function() {
    return har.firstAdviceForTestFile('manyHeaders.har').then(result => {
      assert.strictEqual(
        result.bestpractice.adviceList.manyHeaders.offending.length,
        1
      );
      assert.strictEqual(result.bestpractice.adviceList.manyHeaders.score, 99);
    });
  });
});
