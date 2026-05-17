import test from 'ava';
import har from '../../help/har.js';

test('Avoid loading too many assets from one domain on HTTP/1 / We should be able to find to many assets on one domain', async (t) => {
  const result = await har.firstAdviceForTestFile('fewRequestsPerDomain.har');
  t.is(result.performance.adviceList.fewRequestsPerDomain.offending.length, 1);
  t.true(result.performance.adviceList.fewRequestsPerDomain.score < 100);
});

test('Avoid loading too many assets from one domain on HTTP/1 / We should be able to find no excessive assets on one domain', async (t) => {
  const result = await har.firstAdviceForTestFile('fewRequestsPerDomain2.har');
  t.is(result.performance.adviceList.fewRequestsPerDomain.offending.length, 0);
  t.is(result.performance.adviceList.fewRequestsPerDomain.score, 100);
});
