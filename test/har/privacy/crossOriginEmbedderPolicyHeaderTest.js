import test from 'ava';
import har from '../../help/har.js';

test('Cross-Origin-Embedder-Policy / flags the document when the header is missing', async (t) => {
  const result = await har.firstAdviceForTestFile('manyHeaders.har');
  const advice = result.privacy.adviceList.crossOriginEmbedderPolicyHeader;
  t.is(advice.score, 0);
  t.is(advice.offending.length, 1);
});

test('Cross-Origin-Embedder-Policy / accepts a require-corp value on the document', async (t) => {
  const base = await har.harFromTestFile('manyHeaders.har');
  const clone = JSON.parse(JSON.stringify(base));
  clone.log.entries[0].response.headers.push({
    name: 'cross-origin-embedder-policy',
    value: 'require-corp'
  });
  const result = await har.firstAdviceForHar(clone);
  const advice = result.privacy.adviceList.crossOriginEmbedderPolicyHeader;
  t.is(advice.score, 100);
  t.is(advice.offending.length, 0);
});
