import test from 'ava';
import har from '../../help/har.js';

test('Avoid redirects for the assets / We should be able to find redirects on assets', async (t) => {
  const result = await har.firstAdviceForTestFile('assetsRedirects.har');
  t.is(result.performance.adviceList.assetsRedirects.offending.length, 26);
  t.true(result.performance.adviceList.assetsRedirects.score < 100);
});

test('Avoid redirects for the assets / We should be able to find if there are no redirects at all', async (t) => {
  const result = await har.firstAdviceForTestFile('assetsRedirects2.har');
  t.is(result.performance.adviceList.assetsRedirects.offending.length, 0);
  t.is(result.performance.adviceList.assetsRedirects.score, 100);
});
