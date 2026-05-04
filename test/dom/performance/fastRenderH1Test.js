import { createTestRunner } from '../../help/browsertimeRunner.js';
import assert from 'node:assert';
let BROWSERS = ['chrome', 'firefox'];

describe('Fast render advice HTTP/1:', function() {
  BROWSERS.forEach(function(browser) {
    describe('browser: ' + browser, function() {
      let runner;

      before(async function() {
        runner = await createTestRunner(browser, 'performance');
        await runner.start();
      });

      after(async function() {
        if (runner) await runner.stop();
      });

      it('We should know that synchronous JavaScript and CSS request(s) make the page render slower', function() {
        return runner
          .run('avoidRenderBlocking.js', 'fastrender/avoidJSSyncInHead.html')
          .then(result => {
            // CSS and JS sync hurt in the H1 world
            assert.strictEqual(result.offending.length, 2);
          });
      });

      it('We should know that loading JavaScript asynchronously is OK', function() {
        return runner
          .run('avoidRenderBlocking.js', 'fastrender/jsAsyncIsOk.html')
          .then(result => {
            assert.strictEqual(result.offending.length, 0);
          });
      });
    });
  });
});
