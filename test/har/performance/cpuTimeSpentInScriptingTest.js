import assert from 'node:assert';
import har from '../../help/har.js';

describe('Find too long time spent in scripting', function() {
  it('We should be ble to find long time spent in scripting', function() {
    return har.firstAdviceForTestFile('cpuTime.har').then(result => {
      assert.strictEqual(
        result.performance.adviceList.cpuTimeSpentInScripting.score < 100,
        true
      );
    });
  });
});
