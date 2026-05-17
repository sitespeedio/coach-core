import test from 'ava';
import har from '../../help/har.js';

test("Don't let the CSS files be too large / We should be able to know if a CSS file is too large (optimalCssSize)", async (t) => {
  const result = await har.firstAdviceForTestFile('optimalCssSize.har');
  t.is(result.performance.adviceList.optimalCssSize.score, 90);
});

test("Don't let the CSS files be too large / We should be able to know if a CSS file is too large (optimalCssSize2)", async (t) => {
  const result = await har.firstAdviceForTestFile('optimalCssSize2.har');
  t.is(result.performance.adviceList.optimalCssSize.score, 80);
});
