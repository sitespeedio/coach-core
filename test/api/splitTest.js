import api from '../../lib/index.js';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('pickAPage HAR API:', function() {
  const harPath = join(__dirname, '..', 'har', 'files', 'www.nytimes.com.har');

  it('should work', async () => {
    const text = await readFile(harPath, 'utf8');
    const har = JSON.parse(text);
    assert.strictEqual(api.pickAPage(har, 0).log.pages.length, 1);
  });
});
