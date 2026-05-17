import test from 'ava';
import har from '../../help/har.js';

test('Find too long time spent in scripting / We should be ble to find long time spent in scripting', async (t) => {
  const result = await har.firstAdviceForTestFile('cpuTime.har');
  t.true(result.performance.adviceList.cpuTimeSpentInScripting.score < 100);
});
