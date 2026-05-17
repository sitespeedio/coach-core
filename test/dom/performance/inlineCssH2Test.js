import test from 'ava';
import { createTestRunner } from '../../help/browsertimeRunner.js';

const BROWSERS = ['chrome', 'firefox'];
const runners = new Map();

test.before(async () => {
  for (const browser of BROWSERS) {
    const runner = await createTestRunner(browser, 'performance', true);
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
    `Inline CSS advice HTTP/2 / browser: ${browser} / We should be able to know if we inline CSS and request CSS files`,
    async (t) => {
      const result = await runners
        .get(browser)
        .runGlobalServer(
          'inlineCss.js',
          'https://www.sitespeed.io/testcases/performance/inlinecss/inlineAndRequestCss.html'
        );
      t.is(result.score, 95);
    }
  );

  test.serial(
    `Inline CSS advice HTTP/2 / browser: ${browser} / We should be able to know if we request CSS file(s)`,
    async (t) => {
      const result = await runners
        .get(browser)
        .runGlobalServer(
          'inlineCss.js',
          'https://www.sitespeed.io/testcases/performance/inlinecss/noInlineAndRequestCss.html'
        );
      t.is(result.score, 100);
    }
  );
}
