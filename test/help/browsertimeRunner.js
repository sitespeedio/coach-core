// Drives a real browser via selenium-webdriver to test that DOM rules
// produce the expected score on a fixture HTML page. Replaces the old
// implementation that called runner.loadAndWait / runner.runScript on a
// browsertime engine — those methods are internal to SeleniumRunner and
// were never on the public BrowsertimeEngine class, so the file had been
// dead since browsertime 23. This version uses selenium-webdriver
// directly because all we need is "navigate to URL, wait for load, run
// script, return result"; browsertime is overkill for that.
//
// Driver binaries (chromedriver / geckodriver) are resolved by Selenium
// Manager, which ships with selenium-webdriver. No driver-path config
// required as long as Chrome / Firefox are installed locally.
import { readFile } from 'node:fs/promises';
import { dirname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Builder, Browser } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';
import { startServer, stopServer } from './webserver.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const domRoot = resolve(__dirname, '..', '..', 'lib', 'dom');

async function buildScript(category, ruleFileName) {
  const utilSrc = await readFile(resolve(domRoot, 'util.js'), 'utf8');
  const ruleSrc = await readFile(
    resolve(domRoot, category, ruleFileName),
    'utf8'
  );
  // Each rule file is an IIFE expression that evaluates to the rule
  // result. We concatenate util.js (which defines `const util = {...}`)
  // with `return <ruleIIFE>;` so executeScript returns the result.
  return `${utilSrc}\nreturn ${ruleSrc}`;
}

export async function buildDriver(browser) {
  const builder = new Builder();
  switch (browser) {
    case 'chrome': {
      const opts = new chrome.Options().addArguments(
        '--headless=new',
        '--no-sandbox',
        '--disable-dev-shm-usage'
      );
      return builder.forBrowser(Browser.CHROME).setChromeOptions(opts).build();
    }
    case 'firefox': {
      const opts = new firefox.Options().addArguments('-headless');
      return builder
        .forBrowser(Browser.FIREFOX)
        .setFirefoxOptions(opts)
        .build();
    }
    default:
      throw new Error(`Unknown browser: ${browser}`);
  }
}

export async function createTestRunner(browser, category, useHttp2) {
  let driver;
  let baseUrl;

  return {
    async start() {
      const address = await startServer(useHttp2);
      baseUrl = `${useHttp2 ? 'https' : 'http'}://${address.address}:${address.port}`;
      driver = await buildDriver(browser);
    },

    async stop() {
      try {
        if (driver) {
          await driver.quit();
          driver = undefined;
        }
      } finally {
        await stopServer();
      }
    },

    async runGlobalServer(ruleFileName, url) {
      const script = await buildScript(category, ruleFileName);
      await driver.get(url);
      await driver.wait(
        () =>
          driver.executeScript(
            'return window.performance.timing.loadEventEnd > 0;'
          ),
        30000
      );
      return driver.executeScript(script);
    },

    async run(ruleFileName, testPage) {
      const fixture = testPage || basename(ruleFileName, '.js') + '.html';
      const url = `${baseUrl}/${category}/${fixture}`;
      const script = await buildScript(category, ruleFileName);
      await driver.get(url);
      await driver.wait(
        () =>
          driver.executeScript(
            'return window.performance.timing.loadEventEnd > 0;'
          ),
        30000
      );
      return driver.executeScript(script);
    }
  };
}
