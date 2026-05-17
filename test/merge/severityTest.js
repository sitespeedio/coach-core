import test from 'ava';
import { createRequire } from 'node:module';
import { merge } from '../../lib/merge.js';
import * as severity from '../../lib/severity.js';

const require = createRequire(import.meta.url);
const domResult = require('./files/domResult.json');
const harResult = require('./files/harResult.json');

test('Severity tier / fromWeight fallback / classifies weight >= 8 as error', (t) => {
  t.is(severity.fromWeight(8), 'error');
  t.is(severity.fromWeight(10), 'error');
});

test('Severity tier / fromWeight fallback / classifies weight 4..7 as warn', (t) => {
  t.is(severity.fromWeight(4), 'warn');
  t.is(severity.fromWeight(7), 'warn');
});

test('Severity tier / fromWeight fallback / classifies weight < 4 as info', (t) => {
  t.is(severity.fromWeight(0), 'info');
  t.is(severity.fromWeight(3), 'info');
});

test('Severity tier / fromWeight fallback / falls back to warn for non-numeric weight', (t) => {
  t.is(severity.fromWeight(undefined), 'warn');
  t.is(severity.fromWeight(null), 'warn');
});

test('Severity tier / merge backfill / every advice in the merged result has a severity', (t) => {
  const result = merge(domResult, harResult);
  for (const categoryName of Object.keys(result.advice)) {
    const category = result.advice[categoryName];
    if (!category || !category.adviceList) continue;
    for (const adviceName of Object.keys(category.adviceList)) {
      const advice = category.adviceList[adviceName];
      t.true(
        advice.severity === 'error' ||
          advice.severity === 'warn' ||
          advice.severity === 'info',
        `expected severity on ${categoryName}.${adviceName}, got ${advice.severity}`
      );
    }
  }
});
