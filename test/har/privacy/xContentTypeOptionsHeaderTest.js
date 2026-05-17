import test from 'ava';
import har from '../../help/har.js';

test('X-Content-Type-Options / accepts nosniff on the document', async (t) => {
  // manyHeaders.har has `x-content-type-options: nosniff` on the document.
  const result = await har.firstAdviceForTestFile('manyHeaders.har');
  const advice = result.privacy.adviceList.xContentTypeOptionsHeader;
  t.is(advice.score, 100);
  t.is(advice.offending.length, 0);
});

test('X-Content-Type-Options / flags the document when nosniff is missing', async (t) => {
  // www.nytimes.com.har is an older HAR with no X-Content-Type-Options on
  // the document response.
  const result = await har.firstAdviceForTestFile('www.nytimes.com.har');
  const advice = result.privacy.adviceList.xContentTypeOptionsHeader;
  t.is(advice.score, 0);
  t.true(advice.offending.length >= 1);
});

test('X-Content-Type-Options / rejects values other than nosniff', async (t) => {
  const base = await har.harFromTestFile('manyHeaders.har');
  const clone = JSON.parse(JSON.stringify(base));
  // Drop the existing nosniff entry and replace it with a non-canonical value.
  clone.log.entries[0].response.headers = clone.log.entries[0].response.headers
    .filter((h) => h.name.toLowerCase() !== 'x-content-type-options')
    .concat([{ name: 'x-content-type-options', value: 'something-else' }]);
  const result = await har.firstAdviceForHar(clone);
  const advice = result.privacy.adviceList.xContentTypeOptionsHeader;
  t.is(advice.score, 0);
});
