import test from 'ava';
import har from '../../help/har.js';

test('Avoid too many third party requests / scores 0 when third-party traffic dominates the page', async (t) => {
  // www.nytimes.com.har has more requests and bytes from third-party
  // domains than first-party. The rule deducts 50 for the request
  // imbalance and 50 again for the byte imbalance — clamped to 0.
  const result = await har.firstAdviceForTestFile('www.nytimes.com.har', {
    firstParty: 'nytimes\\.com'
  });
  const advice = result.bestpractice.adviceList.thirdParty;
  t.is(advice.score, 0);
  t.regex(advice.advice, /third party/i);
});

test('Avoid too many third party requests / does not flag a page where first-party traffic dominates', async (t) => {
  // referrerPolicy.har is a small sitespeed.io document where the
  // document itself is the bulk of traffic — the rule should not deduct.
  const result = await har.firstAdviceForTestFile('referrerPolicy.har');
  const advice = result.bestpractice.adviceList.thirdParty;
  t.is(advice.score, 100);
});
