import test from 'ava';
import { merge } from '../../lib/merge.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const domResult = require('./files/domResult.json');
const harResult = require('./files/harResult.json');
const harResultOverride = require('./files/harResultOverride.json');

test('Merging DOM and HAR results / We should have the right amount of performance advice', (t) => {
  const domPerformanceAdvice = Object.keys(
    domResult.advice.performance.adviceList
  ).length;
  const harPerformanceAdvice = Object.keys(
    harResult[0].advice.performance.adviceList
  ).length;
  const result = merge(domResult, harResult);

  t.is(
    Object.keys(result.advice.performance.adviceList).length,
    domPerformanceAdvice + harPerformanceAdvice
  );
});

test('Merging DOM and HAR results / The performance score should be right', (t) => {
  const result = merge(domResult, harResult);
  t.is(result.advice.performance.score, 99);
});

test('Merging DOM and HAR results / The total score should be right', (t) => {
  const result = merge(domResult, harResult);
  t.is(result.advice.score, 98);
});

test('Merging DOM and HAR results / HAR result advice should override DOM advice', (t) => {
  const result = merge(domResult, harResultOverride);
  t.is(
    result.advice.performance.adviceList.altImages.title,
    'altImages from HAR'
  );
});
