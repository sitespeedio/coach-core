import assert from 'node:assert';
import har from '../../help/har.js';

describe('Investigate long response headers', function() {
  it('We should be able to know if headers are too long', function() {
    return har.firstAdviceForTestFile('longHeaders.har').then(result => {
      assert.strictEqual(
        result.bestpractice.adviceList.longHeaders.offending.length,
        1
      );
      assert.strictEqual(result.bestpractice.adviceList.longHeaders.score, 99);
    });
  });
});
