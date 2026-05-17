import test from 'ava';
import { pickAPage as harCutter } from '../../lib/har/harCutter.js';
import helper from '../help/har.js';

test('Test HAR cutter / We should get the correct number of pages from the HAR cutter', async (t) => {
  const har = await helper.harFromTestFile('cacheHeaders.har');
  // the original har har two pages
  t.is(har.log.pages.length, 2);
  const myHar = harCutter(har, 0);
  t.is(myHar.log.pages.length, 1);
  // the old har should have the same amount of pages
  t.is(har.log.pages.length, 2);
});

test('Test HAR cutter / We should get the correct number of entries from the HAR cutter', async (t) => {
  const har = await helper.harFromTestFile('cacheHeaders.har');
  // the original har har two pages
  t.is(har.log.entries.length, 212);
  const myHar = harCutter(har, 0);
  // we got 175 entries with the page id page_1_0
  t.is(myHar.log.entries.length, 175);
});
