import test from 'ava';
import { createTestRunner } from '../../help/browsertimeRunner.js';

const BROWSERS = ['chrome', 'firefox'];
const runners = new Map();

test.before(async () => {
  for (const browser of BROWSERS) {
    const runner = await createTestRunner(browser, 'performance');
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
    `Inline CSS advice HTTP/1 / browser: ${browser} / We should be able to know if we inline CSS and request CSS files`,
    async (t) => {
      const result = await runners
        .get(browser)
        .run('inlineCss.js', 'inlinecss/inlineAndRequestCss.html');
      t.is(result.score, 90);
    }
  );

  test.serial(
    `Inline CSS advice HTTP/1 / browser: ${browser} / We should be able to know if we request CSS files`,
    async (t) => {
      const result = await runners
        .get(browser)
        .run('inlineCss.js', 'inlinecss/noInlineAndRequestCss.html');
      t.is(result.score, 90);
    }
  );
}
