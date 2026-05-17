import test from 'ava';
import har from '../../help/har.js';

test("Never do redirects on the main document / We should be able to find out if page don't do a redirect", async (t) => {
  const result = await har.firstAdviceForTestFile('documentRedirect.har');
  t.is(result.performance.adviceList.documentRedirect.score, 100);
});

test('Never do redirects on the main document / We should be able to find redirects on a the main document', async (t) => {
  const result = await har.firstAdviceForTestFile('documentRedirect2.har');
  t.is(result.performance.adviceList.documentRedirect.score, 0);
});
