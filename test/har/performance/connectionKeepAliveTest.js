import test from 'ava';
import har from '../../help/har.js';

test('Avoid closing a connection that can be used again / We should be able to find connection close', async (t) => {
  const result = await har.firstAdviceForTestFile('connectionKeepAlive.har');
  t.is(result.performance.adviceList.connectionKeepAlive.offending.length, 18);
  t.is(result.performance.adviceList.connectionKeepAlive.score, 0);
});

test('Avoid closing a connection that can be used again / We should be able to know if there are no connection close', async (t) => {
  const result = await har.firstAdviceForTestFile('connectionKeepAlive2.har');
  t.is(result.performance.adviceList.connectionKeepAlive.offending.length, 0);
  t.is(result.performance.adviceList.connectionKeepAlive.score, 100);
});
