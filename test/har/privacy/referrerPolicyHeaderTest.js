import test from 'ava';
import har from '../../help/har.js';

test('Search for referrer policy header / We should be able to find if we do not have a referrer policy header', async (t) => {
  const result = await har.firstAdviceForTestFile('manyHeaders.har');
  t.is(result.privacy.adviceList.referrerPolicyHeader.offending.length, 1);
  t.is(result.privacy.adviceList.referrerPolicyHeader.score, 0);
});

test('Search for referrer policy header / We should be able to find a referrer policy header', async (t) => {
  const result = await har.firstAdviceForTestFile('referrerPolicy.har');
  t.is(result.privacy.adviceList.referrerPolicyHeader.offending.length, 0);
  t.is(result.privacy.adviceList.referrerPolicyHeader.score, 100);
});
