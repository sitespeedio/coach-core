import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert';
import { buildDriver } from '../help/browsertimeRunner.js';
import { startServer, stopServer } from '../help/webserver.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT_NAME = 'coach.min.js';
const scriptPath = resolve(__dirname, '..', '..', 'dist', SCRIPT_NAME);
const BROWSERS = ['chrome', 'firefox'];

describe('Combined minified script [' + SCRIPT_NAME + ']', function() {
  this.timeout(60000);

  BROWSERS.forEach(function(browser) {
    describe('browser: ' + browser, function() {
      let driver;
      let baseUrl;
      let bundle;

      before(async function() {
        bundle = await readFile(scriptPath, 'utf8');
        const address = await startServer();
        baseUrl = `http://${address.address}:${address.port}`;
        driver = await buildDriver(browser);
      });

      after(async function() {
        try {
          if (driver) await driver.quit();
        } finally {
          await stopServer();
        }
      });

      async function runBundle() {
        await driver.get(`${baseUrl}/combined/index.html`);
        await driver.wait(
          () =>
            driver.executeScript(
              'return window.performance.timing.loadEventEnd > 0;'
            ),
          30000
        );
        return driver.executeScript('return ' + bundle);
      }

      it('We should have a combined score for all categories', async function() {
        const result = await runBundle();
        assert.strictEqual(result.advice.score > 0, true);
      });

      it('We should have an average score for performance', async function() {
        const result = await runBundle();
        assert.strictEqual(result.advice.performance.score > 0, true);
      });
    });
  });
});
