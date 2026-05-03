import assert from 'node:assert';
import har from '../../help/har.js';

describe('Avoid bloated pages', function() {
  it('We should be able to know if a page is not too large', function() {
    return har.firstAdviceForTestFile('pageSize.har').then(result => {
      assert.strictEqual(result.performance.adviceList.pageSize.score, 100);
    });
  });

  it('We should be able to know if a page is too large', function() {
    return har.firstAdviceForTestFile('pageSize2.har').then(result => {
      assert.strictEqual(result.performance.adviceList.pageSize.score, 0);
    });
  });
});
