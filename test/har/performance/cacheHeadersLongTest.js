import test from 'ava';
import har from '../../help/har.js';

test('Use cache headers / We should be able to know if cache times are too short', async (t) => {
  const result = await har.firstAdviceForTestFile('cacheHeaders.har');
  t.is(result.performance.adviceList.cacheHeadersLong.score, 0);
  // massive — the fixture has 114 assets with cache times shorter
  // than one year (the new threshold; was 30 days previously).
  t.is(result.performance.adviceList.cacheHeadersLong.offending.length, 114);
});

test('Use cache headers / We should be able to know if cache times are OK', async (t) => {
  const result = await har.firstAdviceForTestFile('cacheHeaders2.har');
  t.is(result.performance.adviceList.cacheHeadersLong.score, 100);
  t.is(result.performance.adviceList.cacheHeadersLong.offending.length, 0);
});
