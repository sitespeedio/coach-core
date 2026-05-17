import test from 'ava';
import har from '../../help/har.js';

test('Cross-Origin-Opener-Policy / flags the document when the header is missing', async (t) => {
  const result = await har.firstAdviceForTestFile('manyHeaders.har');
  const advice = result.privacy.adviceList.crossOriginOpenerPolicyHeader;
  t.is(advice.score, 0);
  t.is(advice.offending.length, 1);
});

test('Cross-Origin-Opener-Policy / accepts a same-origin value on the document', async (t) => {
  const base = await har.harFromTestFile('manyHeaders.har');
  const clone = JSON.parse(JSON.stringify(base));
  clone.log.entries[0].response.headers.push({
    name: 'cross-origin-opener-policy',
    value: 'same-origin'
  });
  const result = await har.firstAdviceForHar(clone);
  const advice = result.privacy.adviceList.crossOriginOpenerPolicyHeader;
  t.is(advice.score, 100);
  t.is(advice.offending.length, 0);
});
