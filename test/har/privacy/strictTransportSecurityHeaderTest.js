import test from 'ava';
import har from '../../help/har.js';

test('Search for strict transport security header / We should be able to find strict transport security header', async (t) => {
  const result = await har.firstAdviceForTestFile(
    'strictTransportSecurityHeader.har'
  );
  t.is(
    result.privacy.adviceList.strictTransportSecurityHeader.offending.length,
    0
  );
  t.is(result.privacy.adviceList.strictTransportSecurityHeader.score, 70);
});
