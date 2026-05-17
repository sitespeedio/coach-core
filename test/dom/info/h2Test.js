import test from 'ava';
import { createTestRunner } from '../../help/browsertimeRunner.js';

const BROWSERS = ['chrome', 'firefox'];
const runners = new Map();

test.before(async () => {
  for (const browser of BROWSERS) {
    const runner = await createTestRunner(browser, 'info', true);
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
    `info - h2 / browser: ${browser} / Should be able to know if the connection is H2`,
    async (t) => {
      const runner = runners.get(browser);
      const result = await runner.runGlobalServer(
        'connectionType.js',
        'https://www.sitespeed.io/'
      );
      t.is(result, 'h2');
    }
  );
}
