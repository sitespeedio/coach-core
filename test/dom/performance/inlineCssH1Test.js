import { createTestRunner } from '../../help/browsertimeRunner.js';
import assert from 'node:assert';
let BROWSERS = ['chrome', 'firefox'];

describe('Inline CSS advice HTTP/1:', function() {
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

      it('We should be able to know if we inline CSS and request CSS files', function() {
        return runner
          .run('inlineCss.js', 'inlinecss/inlineAndRequestCss.html')
          .then(result => {
            assert.strictEqual(result.score, 90);
          });
      });

      it('We should be able to know if we request CSS files', function() {
        return runner
          .run('inlineCss.js', 'inlinecss/noInlineAndRequestCss.html')
          .then(result => {
            assert.strictEqual(result.score, 90);
          });
      });
    });
  });
});
