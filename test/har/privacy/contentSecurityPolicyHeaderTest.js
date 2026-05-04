import assert from 'node:assert';
import har from '../../help/har.js';

describe('Score the Content-Security-Policy header', function() {
  it('flags a CSP that allows unsafe-inline', function() {
    // manyHeaders.har has:
    //   default-src 'self'; style-src 'self' 'unsafe-inline'; img-src ...
    // — so the rule should deduct for unsafe-inline but not give a 0,
    // and the offending list should be empty (the header is present).
    return har.firstAdviceForTestFile('manyHeaders.har').then(result => {
      const advice =
        result.privacy.adviceList.contentSecurityPolicyHeader;
      assert.strictEqual(advice.offending.length, 0);
      assert.ok(
        advice.score < 100 && advice.score > 0,
        `expected unsafe-inline deduction, got score ${advice.score}`
      );
      assert.ok(
        /unsafe-inline/.test(advice.advice),
        `expected advice to mention unsafe-inline, got: ${advice.advice}`
      );
    });
  });

  it('scores 0 when no Content-Security-Policy header is present', function() {
    return har.firstAdviceForTestFile('referrerPolicy.har').then(result => {
      const advice =
        result.privacy.adviceList.contentSecurityPolicyHeader;
      assert.strictEqual(advice.score, 0);
      assert.strictEqual(advice.offending.length, 1);
    });
  });
});
