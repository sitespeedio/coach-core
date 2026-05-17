import test from 'ava';
import har from '../../help/har.js';

test('Find too long time spent in rendering / We should be ble to find long time spent in rendering', async (t) => {
  const result = await har.firstAdviceForTestFile('cpuTime.har');
  t.true(result.performance.adviceList.cpuTimeSpentInRendering.score < 100);
});
