import { createTestRunner } from '../help/browsertimeRunner.js';
import path from 'node:path';
import assert from 'node:assert';

let BROWSERS = ['chrome', 'firefox'];

const SCRIPT_NAME = 'coach.min.js',
  scriptPath = path.resolve(__dirname, '..', '..', 'dist', SCRIPT_NAME);

describe('Combined minified script [' + SCRIPT_NAME + ']', function() {
  this.timeout(60000);

  BROWSERS.forEach(function(browser) {
    describe('browser: ' + browser, async function() {
      const runner = await createTestRunner(browser, 'combined');

      before(() => runner.start(browser));

      after(() => runner.stop());

      it('We should have a combined score for all categories', function() {
        return runner.run(scriptPath, 'index.html').then(result => {
          assert.strictEqual(result.advice.score > 0, true);
        });
      });

      it('We should have an average score for performance', function() {
        return runner.run(scriptPath, 'index.html').then(result => {
          assert.strictEqual(result.advice.performance.score > 0, true);
        });
      });
    });
  });
});
