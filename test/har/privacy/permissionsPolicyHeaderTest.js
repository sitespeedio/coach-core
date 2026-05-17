import test from 'ava';
import har from '../../help/har.js';

test('Permissions-Policy / flags the document when the header is missing', async (t) => {
  const result = await har.firstAdviceForTestFile('manyHeaders.har');
  const advice = result.privacy.adviceList.permissionsPolicyHeader;
  t.is(advice.score, 0);
  t.is(advice.offending.length, 1);
});

test('Permissions-Policy / accepts a Permissions-Policy value on the document', async (t) => {
  const base = await har.harFromTestFile('manyHeaders.har');
  const clone = JSON.parse(JSON.stringify(base));
  clone.log.entries[0].response.headers.push({
    name: 'permissions-policy',
    value: 'camera=(), microphone=(), geolocation=()'
  });
  const result = await har.firstAdviceForHar(clone);
  const advice = result.privacy.adviceList.permissionsPolicyHeader;
  t.is(advice.score, 100);
  t.is(advice.offending.length, 0);
});

test('Permissions-Policy / also accepts the legacy Feature-Policy header', async (t) => {
  const base = await har.harFromTestFile('manyHeaders.har');
  const clone = JSON.parse(JSON.stringify(base));
  clone.log.entries[0].response.headers.push({
    name: 'feature-policy',
    value: "camera 'none'; microphone 'none'"
  });
  const result = await har.firstAdviceForHar(clone);
  const advice = result.privacy.adviceList.permissionsPolicyHeader;
  t.is(advice.score, 100);
  t.is(advice.offending.length, 0);
});
