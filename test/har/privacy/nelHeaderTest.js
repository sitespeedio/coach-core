import test from 'ava';
import har from '../../help/har.js';

test('NEL header / flags the document when the header is missing', async (t) => {
  const result = await har.firstAdviceForTestFile('manyHeaders.har');
  const advice = result.privacy.adviceList.nelHeader;
  t.is(advice.score, 0);
  t.is(advice.offending.length, 1);
});

test('NEL header / accepts a NEL value on the document', async (t) => {
  const base = await har.harFromTestFile('manyHeaders.har');
  const clone = JSON.parse(JSON.stringify(base));
  clone.log.entries[0].response.headers.push({
    name: 'nel',
    value: '{"report_to":"default","max_age":2592000}'
  });
  const result = await har.firstAdviceForHar(clone);
  const advice = result.privacy.adviceList.nelHeader;
  t.is(advice.score, 100);
  t.is(advice.offending.length, 0);
});
