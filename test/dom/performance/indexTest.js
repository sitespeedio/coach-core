'use strict';

const createTestRunner = require('../../help/browsertimeRunner')
    .createTestRunner,
  assert = require('assert');

let BROWSERS = ['chrome', 'firefox'];

describe('Performance advice HTTP/1:', function() {
  this.timeout(60000);

  BROWSERS.forEach(function(browser) {
    describe('browser: ' + browser, async function() {
      const runner = await createTestRunner(browser, 'performance');

      before(() => runner.start(browser));

      after(() => runner.stop());

      it('We should find out if an image is scaled', function() {
        return runner.run('avoidScalingImages.js').then(result => {
          assert.strictEqual(result.offending.length, 1);
        });
      });

      it('We should find out if we load a print CSS', function() {
        return runner.run('cssPrint.js').then(result => {
          assert.strictEqual(result.offending.length, 1);
        });
      });

      it('We should find out if can have SPOF', function() {
        return runner.run('spof.js').then(result => {
          assert.strictEqual(result.offending.length, 2);
        });
      });

      it('Multiple jQuery versions that exist on the same page should be reported', function() {
        return runner.run('jquery.js').then(result => {
          assert.strictEqual(result.offending.length, 2);
        });
      });
    });
  });
});
