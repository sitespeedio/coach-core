import test from 'ava';
import har from '../../help/har.js';

test('Avoid render blocking (HAR) / produces no score when the browser is not Chrome/Edge', async (t) => {
  // The HAR-level rule only reports for Chrome/Edge runs because it
  // relies on the Chrome devtools renderBlocking metadata. Without a
  // browser option set, the rule short-circuits and the runner ends up
  // emitting only the advice metadata — no `score`, no `offending`.
  const result = await har.firstAdviceForTestFile('manyHeaders.har');
  const advice = result.performance.adviceList.avoidRenderBlocking;
  t.is(advice.score, undefined);
  t.is(advice.offending, undefined);
});

test('Avoid render blocking (HAR) / scores 100 on a Chrome HAR with no renderBlocking metadata', async (t) => {
  // Pass browser=chrome to opt into the rule. Without renderBlocking
  // metadata on the assets, the rule has nothing to flag and reports
  // a clean run.
  const result = await har.firstAdviceForTestFile('manyHeaders.har', {
    browser: 'chrome'
  });
  const advice = result.performance.adviceList.avoidRenderBlocking;
  t.is(advice.score, 100);
  t.is(advice.offending.length, 0);
});
