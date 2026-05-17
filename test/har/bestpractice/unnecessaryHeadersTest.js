import test from 'ava';
import har from '../../help/har.js';

test('Investigate response headers for headers we do not need / We should find headers that we do not need', async (t) => {
  const result = await har.firstAdviceForTestFile('unnecessaryHeaders.har');
  t.is(
    result.bestpractice.adviceList.unnecessaryHeaders.offending.length,
    16,
    result.bestpractice.adviceList.unnecessaryHeaders.advice
  );
  t.is(
    result.bestpractice.adviceList.unnecessaryHeaders.score,
    84,
    result.bestpractice.adviceList.unnecessaryHeaders.advice
  );
});
