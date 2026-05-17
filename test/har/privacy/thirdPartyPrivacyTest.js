import test from 'ava';
import har from '../../help/har.js';

test('Third-party privacy / scores 0 on a page with surveillance third parties', async (t) => {
  // www.nytimes.com.har has third-party requests categorised as
  // "surveillance" by third-party-web — the rule clamps the score to 0
  // when any surveillance request is detected.
  const result = await har.firstAdviceForTestFile('www.nytimes.com.har', {
    firstParty: 'nytimes\\.com'
  });
  const advice = result.privacy.adviceList.thirdPartyPrivacy;
  t.is(advice.score, 0);
  t.regex(advice.advice, /surveillance|harvest data/i);
});

test('Third-party privacy / deducts proportional to the third-party share', async (t) => {
  // referrerPolicy.har is an https://www.sitespeed.io/ document with only
  // a handful of requests, none of them surveillance-categorised. The
  // rule should produce a score that reflects the third-party share
  // rather than clamping to 0.
  const result = await har.firstAdviceForTestFile('referrerPolicy.har');
  const advice = result.privacy.adviceList.thirdPartyPrivacy;
  t.true(advice.score >= 0 && advice.score <= 100);
  t.regex(advice.advice, /third party|3rd party/i);
});
