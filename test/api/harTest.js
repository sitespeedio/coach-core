import test from 'ava';
import api from '../../lib/index.js';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('HAR APIs / getHarAdvice / should return at least one advice', async (t) => {
  const adviceList = await api.getHarAdvice();
  t.truthy(adviceList);
  t.true(Object.keys(adviceList).length > 0);
});

test('HAR APIs / getHarAdvice / should only return valid advice', async (t) => {
  const adviceList = await api.getHarAdvice();
  for (const advice of adviceList.performance) {
    for (const property of ['id', 'title', 'description', 'weight', 'tags']) {
      t.true(
        Object.prototype.hasOwnProperty.call(advice, property),
        `advice for ${advice.id} is missing ${property}`
      );
    }
  }
});

test('HAR APIs / analyseHar / should output correct structure', async (t) => {
  const harPath = join(__dirname, '..', 'har', 'files', 'www.nytimes.com.har');
  const har = JSON.parse(await readFile(harPath, 'utf8'));
  const advicePerPage = await api.analyseHar(har);

  t.is(advicePerPage.length, 2);

  const firstPageAdvice = advicePerPage[0];
  t.truthy(firstPageAdvice.version);
  t.truthy(firstPageAdvice.advice && firstPageAdvice.advice.performance);
});
