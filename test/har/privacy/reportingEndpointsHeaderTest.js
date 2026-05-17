import test from 'ava';
import har from '../../help/har.js';

test('Reporting-Endpoints / flags the document when the header is missing', async (t) => {
  const result = await har.firstAdviceForTestFile('manyHeaders.har');
  const advice = result.privacy.adviceList.reportingEndpointsHeader;
  t.is(advice.score, 0);
  t.is(advice.offending.length, 1);
});

test('Reporting-Endpoints / accepts a Reporting-Endpoints value on the document', async (t) => {
  const base = await har.harFromTestFile('manyHeaders.har');
  const clone = JSON.parse(JSON.stringify(base));
  clone.log.entries[0].response.headers.push({
    name: 'reporting-endpoints',
    value: 'default="https://example.com/reports"'
  });
  const result = await har.firstAdviceForHar(clone);
  const advice = result.privacy.adviceList.reportingEndpointsHeader;
  t.is(advice.score, 100);
  t.is(advice.offending.length, 0);
});

test('Reporting-Endpoints / also accepts the legacy Report-To header', async (t) => {
  const base = await har.harFromTestFile('manyHeaders.har');
  const clone = JSON.parse(JSON.stringify(base));
  clone.log.entries[0].response.headers.push({
    name: 'report-to',
    value:
      '{"group":"default","max_age":31536000,"endpoints":[{"url":"https://example.com/reports"}]}'
  });
  const result = await har.firstAdviceForHar(clone);
  const advice = result.privacy.adviceList.reportingEndpointsHeader;
  t.is(advice.score, 100);
  t.is(advice.offending.length, 0);
});
