import test from 'ava';
import har from '../../help/har.js';

test('Third-party cookies / scores 0 on a page with many third-party cookies', async (t) => {
  // www.nytimes.com.har is a real-world fixture loaded with third-party
  // cookies; the rule deducts 10 points per cookie and clamps at 0.
  const result = await har.firstAdviceForTestFile('www.nytimes.com.har', {
    firstParty: 'nytimes\\.com'
  });
  const advice = result.privacy.adviceList.thirdPartyCookies;
  t.is(advice.score, 0);
  t.true(advice.offending.length > 0);
});

test('Third-party cookies / scores 100 on a page with no third-party cookies', async (t) => {
  // manyHeaders.har is a single-document HAR with no third-party cookies.
  const result = await har.firstAdviceForTestFile('manyHeaders.har');
  const advice = result.privacy.adviceList.thirdPartyCookies;
  t.is(advice.score, 100);
  t.is(advice.offending.length, 0);
});
