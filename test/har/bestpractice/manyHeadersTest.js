import test from 'ava';
import har from '../../help/har.js';

test('Investigate many response headers / We should be able to find responses with really many headers', async (t) => {
  const result = await har.firstAdviceForTestFile('manyHeaders.har');
  t.is(result.bestpractice.adviceList.manyHeaders.offending.length, 1);
  t.is(result.bestpractice.adviceList.manyHeaders.score, 99);
});
