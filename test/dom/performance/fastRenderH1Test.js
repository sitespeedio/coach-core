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
    `Fast render advice HTTP/1 / browser: ${browser} / We should know that synchronous JavaScript and CSS request(s) make the page render slower`,
    async (t) => {
      const result = await runners
        .get(browser)
        .run('avoidRenderBlocking.js', 'fastrender/avoidJSSyncInHead.html');
      // CSS and JS sync hurt in the H1 world
      t.is(result.offending.length, 2);
    }
  );

  test.serial(
    `Fast render advice HTTP/1 / browser: ${browser} / We should know that loading JavaScript asynchronously is OK`,
    async (t) => {
      const result = await runners
        .get(browser)
        .run('avoidRenderBlocking.js', 'fastrender/jsAsyncIsOk.html');
      t.is(result.offending.length, 0);
    }
  );
}
