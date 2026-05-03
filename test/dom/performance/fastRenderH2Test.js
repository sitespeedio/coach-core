import { createTestRunner } from '../../help/browsertimeRunner.js';
import assert from 'node:assert';
let BROWSERS = ['chrome', 'firefox'];

describe('Fast render advice HTTP/2:', function() {
  BROWSERS.forEach(function(browser) {
    describe('browser: ' + browser, function() {
      let runner;

      before(async function() {
        runner = await createTestRunner(browser, 'performance', true);
        await runner.start();
      });

      after(async function() {
        if (runner) await runner.stop();
      });

      it('We should know that synchronous JavaScript makes the page render slower', function() {
        return runner
          .runGlobalServer(
            'avoidRenderBlocking.js',
            'https://www.sitespeed.io/testcases/performance/fastrender/avoidJSSyncInHead.html'
          )
          .then(result => {
            // In H2 world we don't hurt CSS, we hope it is pushed.
            assert.strictEqual(result.offending.length, 1);
          });
      });

      it('We should know that loading JavaScript asynchronously is OK', function() {
        return runner
          .runGlobalServer(
            'avoidRenderBlocking.js',
            'https://www.sitespeed.io/testcases/performance/fastrender/jsAsyncIsOk.html'
          )
          .then(result => {
            assert.strictEqual(result.offending.length, 0);
          });
      });

      it('We should know that loading too large CSS files is not OK', function() {
        return runner
          .runGlobalServer(
            'avoidRenderBlocking.js',
            'https://www.sitespeed.io/testcases/performance/fastrender/tooLargeCSS.html'
          )
          .then(result => {
            assert.strictEqual(result.offending.length, 1);
          });
      });
    });
  });
});
