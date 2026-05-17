import test from 'ava';
import har from '../../help/har.js';

test('Score the Content-Security-Policy header / flags a CSP that allows unsafe-inline', async (t) => {
  // manyHeaders.har has:
  //   default-src 'self'; style-src 'self' 'unsafe-inline'; img-src ...
  // — so the rule should deduct for unsafe-inline but not give a 0,
  // and the offending list should be empty (the header is present).
  const result = await har.firstAdviceForTestFile('manyHeaders.har');
  const advice = result.privacy.adviceList.contentSecurityPolicyHeader;
  t.is(advice.offending.length, 0);
  t.true(
    advice.score < 100 && advice.score > 0,
    `expected unsafe-inline deduction, got score ${advice.score}`
  );
  t.regex(
    advice.advice,
    /unsafe-inline/,
    `expected advice to mention unsafe-inline, got: ${advice.advice}`
  );
});

test('Score the Content-Security-Policy header / scores 0 when no Content-Security-Policy header is present', async (t) => {
  const result = await har.firstAdviceForTestFile('referrerPolicy.har');
  const advice = result.privacy.adviceList.contentSecurityPolicyHeader;
  t.is(advice.score, 0);
  t.is(advice.offending.length, 1);
});
