import { createTestRunner } from '../../help/browsertimeRunner.js';
import assert from 'node:assert';
let BROWSERS = ['chrome', 'firefox'];

describe('Privacy', function() {
  this.timeout(60000);

  BROWSERS.forEach(function(browser) {
    describe('browser: ' + browser, function() {
      let runner;

      before(async function() {
        runner = await createTestRunner(browser, 'privacy');
        await runner.start();
      });

      after(async function() {
        if (runner) await runner.stop();
      });

      it('We should be able to detect if a web page is served using HTTPS', function() {
        return runner.run('https.js').then(result => {
          assert.strictEqual(result.score, 0);
        });
      });
    });
  });
});
