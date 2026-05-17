import test from 'ava';
import har from '../../help/har.js';

test("Don't send too large images to the browser / We should be able to know if there are too much image data", async (t) => {
  const result = await har.firstAdviceForTestFile('imageSize.har');
  t.is(result.performance.adviceList.imageSize.score, 50);
});

test("Don't send too large images to the browser / We should be able to know if the amount of image data is OK", async (t) => {
  const result = await har.firstAdviceForTestFile('imageSize2.har');
  t.is(result.performance.adviceList.imageSize.score, 100);
});
