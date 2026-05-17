import test from 'ava';
import har from '../../help/har.js';

test('Avoid bloated pages / We should be able to know if a page is not too large', async (t) => {
  const result = await har.firstAdviceForTestFile('pageSize.har');
  t.is(result.performance.adviceList.pageSize.score, 100);
});

test('Avoid bloated pages / We should be able to know if a page is too large', async (t) => {
  // The fixture is ~2.33 MB. Under the modernised thresholds
  // (3 MB desktop / 2 MB mobile) that's fine on desktop but fails
  // on mobile, so we exercise mobile mode here.
  const result = await har.firstAdviceForTestFile('pageSize2.har', {
    mobile: true
  });
  t.is(result.performance.adviceList.pageSize.score, 0);
});
