import test from 'ava';
import api from '../../lib/index.js';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('pickAPage HAR API / should work', async (t) => {
  const harPath = join(__dirname, '..', 'har', 'files', 'www.nytimes.com.har');
  const text = await readFile(harPath, 'utf8');
  const har = JSON.parse(text);
  t.is(api.pickAPage(har, 0).log.pages.length, 1);
});
