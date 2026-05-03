import api from '../../lib/index.js';
import { use, should } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { buildDriver } from '../help/browsertimeRunner.js';
import { startServer, stopServer } from '../help/webserver.js';

use(chaiAsPromised);
should();

const BROWSERS = ['chrome', 'firefox'];

describe('DOM APIs:', function() {
  let url;

  before(async function() {
    const address = await startServer();
    url = `http://${address.address}:${address.port}/info/head.html`;
  });

  after(() => stopServer());

  describe('getDomAdvice', function() {
    it('should return a script', function() {
      return api.getDomAdvice().should.eventually.not.be.empty;
    });
  });

  // The previous version of this test called api.runDomAdvice(url, advice,
  // options) — a high-level helper that no longer exists on the public
  // API. We exercise the equivalent path here: take the bundled DOM
  // script, drive a real browser to a fixture page, evaluate the bundle
  // there, and check the returned object has the expected shape.
  BROWSERS.forEach(function(browser) {
    describe('full DOM bundle: ' + browser, function() {
      this.timeout(60000);
      let driver;
      let bundle;

      before(async function() {
        bundle = await api.getDomAdvice();
        driver = await buildDriver(browser);
      });

      after(async function() {
        if (driver) await driver.quit();
      });

      it('should run the bundle and report info advice', async function() {
        await driver.get(url);
        await driver.wait(
          () =>
            driver.executeScript(
              'return window.performance.timing.loadEventEnd > 0;'
            ),
          30000
        );
        const result = await driver.executeScript('return ' + bundle);
        result.should.have.nested.property('advice.info.amp');
      });
    });
  });
});
