import test from 'ava';
import har from '../../help/har.js';

test('Avoid multiple fonts on a page / We should be able to find multiple fonts on a page', async (t) => {
  const result = await har.firstAdviceForTestFile('fewFonts.har');
  t.is(result.performance.adviceList.fewFonts.offending.length, 11);
  t.true(result.performance.adviceList.fewFonts.score < 100);
});

test('Avoid multiple fonts on a page / We should be able to know if there are no or just one font on a page', async (t) => {
  const result = await har.firstAdviceForTestFile('fewFonts2.har');
  t.is(result.performance.adviceList.fewFonts.offending.length, 0);
  t.is(result.performance.adviceList.fewFonts.score, 100);
});
