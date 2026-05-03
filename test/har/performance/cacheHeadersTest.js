import assert from 'node:assert';
import har from '../../help/har.js';

describe('Use cache headers', function() {
  it('We should be able to know if we have failing cache headers', function() {
    return har.firstAdviceForTestFile('cacheHeaders.har').then(result => {
      assert.strictEqual(result.performance.adviceList.cacheHeaders.score, 0);
      // massive
      assert.strictEqual(
        result.performance.adviceList.cacheHeaders.offending.length,
        45
      );
    });
  });

  it('We should be able to know if we the cache headers are OK', function() {
    return har.firstAdviceForTestFile('cacheHeaders2.har').then(result => {
      assert.strictEqual(result.performance.adviceList.cacheHeaders.score, 100);
      assert.strictEqual(
        result.performance.adviceList.cacheHeaders.offending.length,
        0
      );
    });
  });
});
