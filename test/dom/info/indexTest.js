import test from 'ava';
import { createTestRunner } from '../../help/browsertimeRunner.js';

const BROWSERS = ['chrome', 'firefox'];
const runners = new Map();

test.before(async () => {
  for (const browser of BROWSERS) {
    const runner = await createTestRunner(browser, 'info');
    await runner.start();
    runners.set(browser, runner);
  }
});

test.after.always(async () => {
  for (const runner of runners.values()) {
    try {
      await runner.stop();
    } catch {
      // ignore
    }
  }
});

for (const browser of BROWSERS) {
  test.serial(
    `Info / browser: ${browser} / We should be able to find the assets inside the head tag`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('head.js');
      t.is(result.jssync.length, 1);
      t.is(result.jsasync.length, 1);
      t.is(result.css.length, 2);
    }
  );

  test.serial(
    `Info / browser: ${browser} / We should be able to identify a AMP page`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('amp.js');
      t.is(result, '1450396666888');
    }
  );

  test.serial(
    `Info / browser: ${browser} / We should be able to identify the connection type`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners
        .get(browser)
        .runGlobalServer('connectionType.js', 'https://www.sitespeed.io/');
      t.not(result, 'unknown');
    }
  );

  test.serial(
    `Info / browser: ${browser} / We should be able to find iframes`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('iframes.js');
      t.is(result, 2);
    }
  );

  test.serial(
    `Info / browser: ${browser} / We should be able to get the title`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('documentTitle.js');
      t.is(result, 'Document title');
    }
  );

  test.serial(
    `Info / browser: ${browser} / We should be able to get the document height`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('documentHeight.js');
      t.true(result > 0);
    }
  );

  test.serial(
    `Info / browser: ${browser} / We should be able to get the document width`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('documentWidth.js');
      t.true(result > 0);
    }
  );

  test.serial(
    `Info / browser: ${browser} / We should be able to count the DOM depth`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('domDepth.js');
      t.is(result.avg, 3);
      t.is(result.max, 4);
    }
  );

  test.serial(
    `Info / browser: ${browser} / We should be able to get the DOM elements`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('domElements.js');
      t.is(result, 26);
    }
  );

  test.serial(
    `Info / browser: ${browser} / We should be able to get the local storage size`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('localStorageSize.js');
      t.true(result > 0);
    }
  );

  test.serial(
    `Info / browser: ${browser} / We should be able to get the session storage size`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('sessionStorageSize.js');
      t.true(result > 0);
    }
  );

  test.serial(
    `Info / browser: ${browser} / We should be able to get the window size`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('windowSize.js');
      t.regex(result, /^\d+x\d+$/);
    }
  );

  test.serial(
    `Info / browser: ${browser} / We should be able to know which browser runs`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('browser.js');
      t.not(result, 'unknown');
    }
  );

  test.serial(
    `Info / browser: ${browser} / We should be able to get resource hints`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('resourceHints.js');
      t.is(
        result.prerender[0],
        'http://0.0.0.0:8282/info/amp.html',
        'Could not fetch prerender'
      );
      t.is(
        result.preconnect[0],
        'http://example.com/',
        'Could not fetch preconnect'
      );
      t.true(
        result.prefetch[0].endsWith('/info/js/body.js'),
        'Could not fetch prefetch'
      );
      t.is(
        result['dns-prefetch'][0],
        'http://example.com/',
        'Could not fetch dns-prefetch'
      );
    }
  );

  test.serial(
    `Info / browser: ${browser} / We should be able to know if the page uses user timings`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('userTiming.js');
      t.is(result.marks, 1);
    }
  );
}
