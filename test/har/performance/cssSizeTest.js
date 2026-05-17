import test from 'ava';
import har from '../../help/har.js';

test("Don't send too much CSS to the browser / We should be able to know if there are too much CSS (cssSize)", async (t) => {
  const result = await har.firstAdviceForTestFile('cssSize.har');
  t.is(result.performance.adviceList.cssSize.score, 100);
});

test("Don't send too much CSS to the browser / We should be able to know if there are too much CSS (cssSize2)", async (t) => {
  const result = await har.firstAdviceForTestFile('cssSize2.har');
  t.is(result.performance.adviceList.cssSize.score, 50);
});
