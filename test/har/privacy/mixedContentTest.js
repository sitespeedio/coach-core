import test from 'ava';
import har from '../../help/har.js';

test('Mixed content / does not flag an HTTPS page with no HTTP assets', async (t) => {
  // referrerPolicy.har is an https://www.sitespeed.io/ document with all
  // assets served over HTTPS.
  const result = await har.firstAdviceForTestFile('referrerPolicy.har');
  const advice = result.privacy.adviceList.mixedContent;
  t.is(advice.score, 100);
  t.is(advice.offending.length, 0);
});

test('Mixed content / flags an HTTPS page with HTTP assets', async (t) => {
  const base = await har.harFromTestFile('referrerPolicy.har');
  const clone = JSON.parse(JSON.stringify(base));
  const httpEntry = JSON.parse(JSON.stringify(clone.log.entries[0]));
  httpEntry.request.url = 'http://insecure.example.com/image.png';
  clone.log.entries.push(httpEntry);
  const result = await har.firstAdviceForHar(clone);
  const advice = result.privacy.adviceList.mixedContent;
  t.is(advice.score, 0);
  t.true(advice.offending.length >= 1);
});

test('Mixed content / does not check assets when the page itself is HTTP', async (t) => {
  // www.nytimes.com.har is an http:// page; the rule short-circuits and
  // returns score 100 without inspecting assets.
  const result = await har.firstAdviceForTestFile('www.nytimes.com.har');
  const advice = result.privacy.adviceList.mixedContent;
  t.is(advice.score, 100);
});
