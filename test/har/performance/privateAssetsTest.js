import test from 'ava';
import har from '../../help/har.js';

test('Avoid setting private headers on items that can be cached / We should be able to find cache headers that are private', async (t) => {
  const result = await har.firstAdviceForTestFile('privateAssets.har');
  t.is(result.performance.adviceList.privateAssets.offending.length, 31);
  t.is(result.performance.adviceList.privateAssets.score, 0);
});

test('Avoid setting private headers on items that can be cached / We should be able to know if headers are not private', async (t) => {
  const result = await har.firstAdviceForTestFile('privateAssets2.har');
  t.is(result.performance.adviceList.privateAssets.score, 100);
});
