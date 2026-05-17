import test from 'ava';
import { createTestRunner } from '../../help/browsertimeRunner.js';

const BROWSERS = ['chrome', 'firefox'];
const runners = new Map();

test.before(async () => {
  for (const browser of BROWSERS) {
    const runner = await createTestRunner(browser, 'timings');
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
    `Timings / browser: ${browser} / We should get a Navigation Timings`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners
        .get(browser)
        .run('navigationTimings.js', 'index.html');
      t.true(result.loadEventEnd > 0);
    }
  );

  test.serial(
    `Timings / browser: ${browser} / We should get User Timing Marks`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners
        .get(browser)
        .run('userTimings.js', 'index.html');
      t.true(result.marks[0].startTime > 0);
    }
  );

  test.serial(
    `Timings / browser: ${browser} / We should get User Timing measurements`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners
        .get(browser)
        .run('userTimings.js', 'index.html');
      t.true(result.measures[0].duration > 0);
    }
  );

  test.serial(
    `Timings / browser: ${browser} / We should get a fully loaded timing`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners
        .get(browser)
        .run('fullyLoaded.js', 'index.html');
      t.true(result > 0);
    }
  );
}
