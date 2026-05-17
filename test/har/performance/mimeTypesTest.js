import test from 'ava';
import har from '../../help/har.js';

const harfileCorrect = 'mimeTypesCorrect.har';
const harfileIncorrect = 'mimeTypesIncorrect.har';

// In the harfileIncorrect file, the mimeType for the following resources were
// changed to 'blah': https://run.sitespeed.io/img/logos/logoBig2.svg

test('Avoid incorrectly configured mime types / We should be able to know incorrect mime types', async (t) => {
  const result = await har.firstAdviceForTestFile(harfileIncorrect);
  t.is(result.performance.adviceList.mimeTypes.score, 99);
});

test('Avoid incorrectly configured mime types / We should be able to know correct mime types', async (t) => {
  const result = await har.firstAdviceForTestFile(harfileCorrect);
  t.is(result.performance.adviceList.mimeTypes.score, 100);
  t.is(result.performance.adviceList.mimeTypes.offending.length, 0);
});
