import test from 'ava';
import har from '../../help/har.js';

test('Use cache headers / We should be able to know if we have failing cache headers', async (t) => {
  const result = await har.firstAdviceForTestFile('cacheHeaders.har');
  t.is(result.performance.adviceList.cacheHeaders.score, 0);
  // massive
  t.is(result.performance.adviceList.cacheHeaders.offending.length, 45);
});

test('Use cache headers / We should be able to know if we the cache headers are OK', async (t) => {
  const result = await har.firstAdviceForTestFile('cacheHeaders2.har');
  t.is(result.performance.adviceList.cacheHeaders.score, 100);
  t.is(result.performance.adviceList.cacheHeaders.offending.length, 0);
});
