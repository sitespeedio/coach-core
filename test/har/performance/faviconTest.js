import test from 'ava';
import har from '../../help/har.js';

test('Use favicon / We should be able to know if we have a favicon', async (t) => {
  const result = await har.firstAdviceForTestFile('favicon.har');
  t.is(result.performance.adviceList.favicon.score, 100);
});
