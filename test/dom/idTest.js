import assert from 'node:assert';
import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Verify advice IDs', function() {
  it('We should have an ID that matches the file name', async function() {
    const domAdviceDir = join(__dirname, '..', '..', 'lib', 'dom');
    const adviceCategoriesWithIds = ['bestpractice', 'performance'];

    const entries = await readdir(domAdviceDir);
    for (const entry of entries) {
      if (!adviceCategoriesWithIds.includes(entry)) continue;
      const entryPath = join(domAdviceDir, entry);
      if (!(await stat(entryPath)).isDirectory()) continue;

      const files = await readdir(entryPath);
      for (const filename of files) {
        if (!filename.endsWith('.js')) continue;
        const name = filename.slice(0, -3);
        const contents = await readFile(join(entryPath, filename), 'utf8');
        const match = contents.match(/id: '([^']*)',/);
        assert.ok(match, `No id field found in ${filename}`);
        assert.strictEqual(
          match[1],
          name,
          `Mismatch of ID/filename for ${filename}`
        );
      }
    }
  });
});
