import test from 'ava';
import har from '../../help/har.js';

test("Don't send too much data in the headers / We should be able to know if there are too large headers (headerSize)", async (t) => {
  const result = await har.firstAdviceForTestFile('headerSize.har');
  t.is(result.performance.adviceList.headerSize.score, 100);
});

test("Don't send too much data in the headers / We should be able to know if there are too large headers (headerSize2)", async (t) => {
  const result = await har.firstAdviceForTestFile('headerSize2.har');
  t.is(result.performance.adviceList.headerSize.score, 90);
  t.is(result.performance.adviceList.headerSize.offending.length, 1);
});
