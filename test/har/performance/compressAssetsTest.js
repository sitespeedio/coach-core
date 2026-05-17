import test from 'ava';
import har from '../../help/har.js';

test('Always compress text content / We should be able to know that all content is compressed', async (t) => {
  const result = await har.firstAdviceForTestFile('compressAssets.har');
  t.is(result.performance.adviceList.compressAssets.offending.length, 0);
  t.is(result.performance.adviceList.compressAssets.score, 100);
});

test('Always compress text content / We should be able to find content that is not compressed', async (t) => {
  const result = await har.firstAdviceForTestFile('compressAssets2.har');
  t.true(result.performance.adviceList.compressAssets.score < 100);
});
