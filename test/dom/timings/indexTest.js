import { createTestRunner } from '../../help/browsertimeRunner.js';
import assert from 'node:assert';
let BROWSERS = ['chrome', 'firefox'];

describe('Timings', function() {
  this.timeout(60000);

  BROWSERS.forEach(function(browser) {
    describe('browser: ' + browser, function() {
      let runner;

      before(async function() {
        runner = await createTestRunner(browser, 'timings');
        await runner.start();
      });

      after(async function() {
        if (runner) await runner.stop();
      });

      it('We should get a Navigation Timings', function() {
        return runner.run('navigationTimings.js', 'index.html').then(result => {
          assert.strictEqual(result.loadEventEnd > 0, true);
        });
      });

      it('We should get User Timing Marks', function() {
        return runner.run('userTimings.js', 'index.html').then(result => {
          assert.strictEqual(result.marks[0].startTime > 0, true);
        });
      });

      it('We should get User Timing measurements', function() {
        return runner.run('userTimings.js', 'index.html').then(result => {
          assert.strictEqual(result.measures[0].duration > 0, true);
        });
      });

      it('We should get a fully loaded timing', function() {
        return runner.run('fullyLoaded.js', 'index.html').then(result => {
          assert.strictEqual(result > 0, true);
        });
      });
    });
  });
});
