import test from 'ava';
import har from '../../help/har.js';

test('Avoid 40X and 50X / We should be able to know if we have an error in one request', async (t) => {
  const result = await har.firstAdviceForTestFile('responseOk.har');
  t.is(result.performance.adviceList.responseOk.score, 90);
  t.is(result.performance.adviceList.responseOk.offending.length, 1);
});

test('Avoid 40X and 50X / We should be able to know if there are no errors', async (t) => {
  const result = await har.firstAdviceForTestFile('responseOk2.har');
  t.is(result.performance.adviceList.responseOk.score, 100);
  t.is(result.performance.adviceList.responseOk.offending.length, 0);
});
