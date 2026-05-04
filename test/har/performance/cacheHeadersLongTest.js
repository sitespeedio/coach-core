import assert from 'node:assert';
import har from '../../help/har.js';

describe('Use cache headers', function() {
  it('We should be able to know if cache times are too short', function() {
    return har.firstAdviceForTestFile('cacheHeaders.har').then(result => {
      assert.strictEqual(
        result.performance.adviceList.cacheHeadersLong.score,
        0
      );
      // massive — the fixture has 114 assets with cache times shorter
      // than one year (the new threshold; was 30 days previously).
      assert.strictEqual(
        result.performance.adviceList.cacheHeadersLong.offending.length,
        114
      );
    });
  });

  it('We should be able to know if cache times are OK', function() {
    return har.firstAdviceForTestFile('cacheHeaders2.har').then(result => {
      assert.strictEqual(
        result.performance.adviceList.cacheHeadersLong.score,
        100
      );
      assert.strictEqual(
        result.performance.adviceList.cacheHeadersLong.offending.length,
        0
      );
    });
  });
});
