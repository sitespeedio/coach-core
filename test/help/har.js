import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as api from '../../lib/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function harFromTestFile(fileName) {
  const text = await readFile(
    resolve(__dirname, '..', 'har', 'files', fileName),
    'utf8'
  );
  return JSON.parse(text);
}

export async function firstAdviceForTestFile(fileName, options) {
  const advice = await api.getHarAdvice();
  const har = await harFromTestFile(fileName);
  const result = await api.analyseHar(har, advice, undefined, options);
  return result[0].advice;
}

// Run the advice pipeline against an in-memory HAR (typically a fixture clone
// with a tweak applied). Returns the first page's advice block.
export async function firstAdviceForHar(har, options) {
  const advice = await api.getHarAdvice();
  const result = await api.analyseHar(har, advice, undefined, options);
  return result[0].advice;
}

export default {
  harFromTestFile,
  firstAdviceForTestFile,
  firstAdviceForHar
};
