import test from 'ava';
import har from '../../help/har.js';

test('Investigate long response headers / We should be able to know if headers are too long', async (t) => {
  const result = await har.firstAdviceForTestFile('longHeaders.har');
  t.is(result.bestpractice.adviceList.longHeaders.offending.length, 1);
  t.is(result.bestpractice.adviceList.longHeaders.score, 99);
});
