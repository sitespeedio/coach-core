import assert from 'node:assert';
import { createRequire } from 'node:module';
import { merge } from '../../lib/merge.js';
import * as severity from '../../lib/severity.js';

const require = createRequire(import.meta.url);
const domResult = require('./files/domResult.json');
const harResult = require('./files/harResult.json');

describe('Severity tier', function () {
  describe('fromWeight fallback', function () {
    it('classifies weight >= 8 as error', function () {
      assert.strictEqual(severity.fromWeight(8), 'error');
      assert.strictEqual(severity.fromWeight(10), 'error');
    });

    it('classifies weight 4..7 as warn', function () {
      assert.strictEqual(severity.fromWeight(4), 'warn');
      assert.strictEqual(severity.fromWeight(7), 'warn');
    });

    it('classifies weight < 4 as info', function () {
      assert.strictEqual(severity.fromWeight(0), 'info');
      assert.strictEqual(severity.fromWeight(3), 'info');
    });

    it('falls back to warn for non-numeric weight', function () {
      assert.strictEqual(severity.fromWeight(undefined), 'warn');
      assert.strictEqual(severity.fromWeight(null), 'warn');
    });
  });

  describe('merge backfill', function () {
    it('every advice in the merged result has a severity', function () {
      const result = merge(domResult, harResult);
      Object.keys(result.advice).forEach(function (categoryName) {
        const category = result.advice[categoryName];
        if (!category || !category.adviceList) {
          return;
        }
        Object.keys(category.adviceList).forEach(function (adviceName) {
          const advice = category.adviceList[adviceName];
          assert.ok(
            advice.severity === 'error' ||
              advice.severity === 'warn' ||
              advice.severity === 'info',
            `expected severity on ${categoryName}.${adviceName}, got ${advice.severity}`
          );
        });
      });
    });
  });
});
