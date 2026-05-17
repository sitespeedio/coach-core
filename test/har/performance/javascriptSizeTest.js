import test from 'ava';
import har from '../../help/har.js';

test("Don't send too many JavaScript files to the browser / We should be able to know if there are too many JavaScript files (javascriptSize)", async (t) => {
  const result = await har.firstAdviceForTestFile('javascriptSize.har');
  t.is(result.performance.adviceList.javascriptSize.score, 50);
});

test("Don't send too many JavaScript files to the browser / We should be able to know if there are too many JavaScript files (javascriptSize2)", async (t) => {
  const result = await har.firstAdviceForTestFile('javascriptSize2.har');
  t.is(result.performance.adviceList.javascriptSize.score, 100);
});
