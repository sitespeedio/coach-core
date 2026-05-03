import assert from 'node:assert';
import har from '../../help/har.js';

describe('Avoid closing a connection that can be used again', function() {
  it('We should be able to find connection close', function() {
    return har
      .firstAdviceForTestFile('connectionKeepAlive.har')
      .then(result => {
        assert.strictEqual(
          result.performance.adviceList.connectionKeepAlive.offending.length,
          18
        );
        assert.strictEqual(
          result.performance.adviceList.connectionKeepAlive.score,
          0
        );
      });
  });

  it('We should be able to know if there are no connection close', function() {
    return har
      .firstAdviceForTestFile('connectionKeepAlive2.har')
      .then(result => {
        assert.strictEqual(
          result.performance.adviceList.connectionKeepAlive.offending.length,
          0
        );
        assert.strictEqual(
          result.performance.adviceList.connectionKeepAlive.score,
          100
        );
      });
  });
});
