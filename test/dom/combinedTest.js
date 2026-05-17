import test from 'ava';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDriver } from '../help/browsertimeRunner.js';
import { startServer, stopServer } from '../help/webserver.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT_NAME = 'coach.min.js';
const scriptPath = resolve(__dirname, '..', '..', 'dist', SCRIPT_NAME);
const BROWSERS = ['chrome', 'firefox'];

const drivers = new Map();
let baseUrl;
let bundle;

test.before(async () => {
  bundle = await readFile(scriptPath, 'utf8');
  const address = await startServer();
  baseUrl = `http://${address.address}:${address.port}`;
  for (const browser of BROWSERS) {
    drivers.set(browser, await buildDriver(browser));
  }
});

test.after.always(async () => {
  for (const driver of drivers.values()) {
    try {
      await driver.quit();
    } catch {
      // ignore — best-effort cleanup
    }
  }
  await stopServer();
});

async function runBundle(driver) {
  await driver.get(`${baseUrl}/combined/index.html`);
  await driver.wait(
    () =>
      driver.executeScript(
        'return window.performance.timing.loadEventEnd > 0;'
      ),
    30_000
  );
  return driver.executeScript('return ' + bundle);
}

for (const browser of BROWSERS) {
  test.serial(
    `Combined minified script [${SCRIPT_NAME}] / browser: ${browser} / We should have a combined score for all categories`,
    async (t) => {
      t.timeout(60_000);
      const driver = drivers.get(browser);
      const result = await runBundle(driver);
      t.true(result.advice.score > 0);
    }
  );

  test.serial(
    `Combined minified script [${SCRIPT_NAME}] / browser: ${browser} / We should have an average score for performance`,
    async (t) => {
      t.timeout(60_000);
      const driver = drivers.get(browser);
      const result = await runBundle(driver);
      t.true(result.advice.performance.score > 0);
    }
  );
}
