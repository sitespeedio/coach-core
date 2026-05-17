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
    `Performance advice HTTP/1 / browser: ${browser} / We should find out if an image is scaled`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('avoidScalingImages.js');
      t.is(result.offending.length, 1);
    }
  );

  test.serial(
    `Performance advice HTTP/1 / browser: ${browser} / We should find out if we load a print CSS`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('cssPrint.js');
      t.is(result.offending.length, 1);
    }
  );

  test.serial(
    `Performance advice HTTP/1 / browser: ${browser} / We should find out if can have SPOF`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('spof.js');
      t.is(result.offending.length, 2);
    }
  );

  test.serial(
    `Performance advice HTTP/1 / browser: ${browser} / Multiple jQuery versions that exist on the same page should be reported`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('jquery.js');
      t.is(result.offending.length, 2);
    }
  );
}
