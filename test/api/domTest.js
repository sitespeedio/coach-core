import test from 'ava';
import api from '../../lib/index.js';
import { buildDriver } from '../help/browsertimeRunner.js';
import { startServer, stopServer } from '../help/webserver.js';

const BROWSERS = ['chrome', 'firefox'];

let url;
const drivers = new Map();
let bundle;

test.before(async () => {
  const address = await startServer();
  url = `http://${address.address}:${address.port}/info/head.html`;
  bundle = await api.getDomAdvice();
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

test.serial('DOM APIs / getDomAdvice / should return a script', async (t) => {
  const script = await api.getDomAdvice();
  t.truthy(script);
  t.true(script.length > 0);
});

// The previous version of this test called api.runDomAdvice(url, advice,
// options) — a high-level helper that no longer exists on the public
// API. We exercise the equivalent path here: take the bundled DOM
// script, drive a real browser to a fixture page, evaluate the bundle
// there, and check the returned object has the expected shape.
for (const browser of BROWSERS) {
  test.serial(
    `DOM APIs / full DOM bundle: ${browser} / should run the bundle and report info advice`,
    async (t) => {
      t.timeout(60_000);
      const driver = drivers.get(browser);
      await driver.get(url);
      await driver.wait(
        () =>
          driver.executeScript(
            'return window.performance.timing.loadEventEnd > 0;'
          ),
        30_000
      );
      const result = await driver.executeScript('return ' + bundle);
      // Ordinary page, so info.amp is legitimately false — assert the
      // bundle produced the info block, not that the page is AMP.
      t.is(result.advice.info.amp, false);
      t.truthy(result.advice.performance.adviceList);
      t.is(result.url, url);
    }
  );
}
