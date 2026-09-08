import test from 'ava';
import { createTestRunner } from '../help/browsertimeRunner.js';
import fs from 'node:fs';
import path from 'node:path';

const ADVICE_CATEGORIES = ['bestpractice', 'performance'];
const KEYS = [
  'id',
  'title',
  'description',
  'advice',
  'score',
  'weight',
  'severity',
  'offending',
  'tags'
];

function assertKeys(t, result, filename) {
  for (const key of KEYS) {
    t.true(
      Object.prototype.hasOwnProperty.call(result, key),
      `The ${filename} advice is missing the ${key} key`
    );
  }
  t.is(
    Object.keys(result).length,
    KEYS.length,
    `The ${filename} advice doesn't return the right number of keys`
  );
}

const runners = new Map();

test.before(async () => {
  for (const category of ADVICE_CATEGORIES) {
    const runner = await createTestRunner('chrome', category);
    await runner.start();
    runners.set(category, runner);
  }
});

test.after.always(async () => {
  for (const runner of runners.values()) {
    try {
      await runner.stop();
    } catch {
      // ignore — best-effort cleanup
    }
  }
});

for (const category of ADVICE_CATEGORIES) {
  const dir = `lib/dom/${category}/`;
  for (const filename of fs.readdirSync(dir)) {
    if (path.extname(filename) !== '.js') continue;
    test.serial(
      `Verify advice structure / category: ${category} / We should return the keys for ${filename}`,
      async (t) => {
        t.timeout(60_000);
        const runner = runners.get(category);
        const result = await runner.run(filename);
        assertKeys(t, result, filename);
      }
    );
  }
}
