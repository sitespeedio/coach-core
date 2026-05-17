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
    `Fast render advice HTTP/2 / browser: ${browser} / We should know that synchronous JavaScript makes the page render slower`,
    async (t) => {
      const result = await runners
        .get(browser)
        .runGlobalServer(
          'avoidRenderBlocking.js',
          'https://www.sitespeed.io/testcases/performance/fastrender/avoidJSSyncInHead.html'
        );
      // In H2 world we don't hurt CSS, we hope it is pushed.
      t.is(result.offending.length, 1);
    }
  );

  test.serial(
    `Fast render advice HTTP/2 / browser: ${browser} / We should know that loading JavaScript asynchronously is OK`,
    async (t) => {
      const result = await runners
        .get(browser)
        .runGlobalServer(
          'avoidRenderBlocking.js',
          'https://www.sitespeed.io/testcases/performance/fastrender/jsAsyncIsOk.html'
        );
      t.is(result.offending.length, 0);
    }
  );

  test.serial(
    `Fast render advice HTTP/2 / browser: ${browser} / We should know that loading too large CSS files is not OK`,
    async (t) => {
      const result = await runners
        .get(browser)
        .runGlobalServer(
          'avoidRenderBlocking.js',
          'https://www.sitespeed.io/testcases/performance/fastrender/tooLargeCSS.html'
        );
      t.is(result.offending.length, 1);
    }
  );
}
