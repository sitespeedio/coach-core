import test from 'ava';
import { createTestRunner } from '../../help/browsertimeRunner.js';

const BROWSERS = ['chrome', 'firefox'];
const runners = new Map();

test.before(async () => {
  for (const browser of BROWSERS) {
    const runner = await createTestRunner(browser, 'privacy');
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
    `Privacy / browser: ${browser} / We should be able to detect if a web page is served using HTTPS`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('https.js');
      t.is(result.score, 0);
    }
  );
}
