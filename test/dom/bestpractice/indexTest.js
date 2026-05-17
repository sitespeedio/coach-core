import test from 'ava';
import { createTestRunner } from '../../help/browsertimeRunner.js';

const BROWSERS = ['chrome', 'firefox'];
const runners = new Map();

test.before(async () => {
  for (const browser of BROWSERS) {
    const runner = await createTestRunner(browser, 'bestpractice');
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
    `Best practice / browser: ${browser} / We should be able to check the title tag`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('pageTitle.js');
      t.is(result.score, 50);
    }
  );

  test.serial(
    `Best practice / browser: ${browser} / We should be able to check if the page is missing a description meta tag`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners
        .get(browser)
        .run('metaDescription.js', 'missingMetaDescription.html');
      t.is(result.score, 0);
    }
  );

  test.serial(
    `Best practice / browser: ${browser} / We should be able to check if the page has a description meta tag`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('metaDescription.js');
      t.is(result.score, 100);
    }
  );

  test.serial(
    `Best practice / browser: ${browser} / We should find meta description meta tag in upper case`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners
        .get(browser)
        .run('metaDescription.js', 'upperCaseMetaDescription.html');
      t.is(result.score, 100);
    }
  );

  test.serial(
    `Best practice / browser: ${browser} / We should be able to know if a page is missing the doctype`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('doctype.js');
      t.is(result.score, 0);
    }
  );

  test.serial(
    `Best practice / browser: ${browser} / We should be able to know if a page is using a non-HTML5 doctype`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners
        .get(browser)
        .run('doctype.js', 'doctype4.html');
      t.is(result.score, 25);
    }
  );

  test.serial(
    `Best practice / browser: ${browser} / We should be able to know if a page is using the HTML5 doctype`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners
        .get(browser)
        .run('doctype.js', 'doctype5.html');
      t.is(result.score, 100);
    }
  );

  test.serial(
    `Best practice / browser: ${browser} / We should be able to detect the character set of a page`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('charset.js');
      t.is(result.score, 100);
    }
  );

  test.serial(
    `Best practice / browser: ${browser} / We should be able to detect if a web page has set a language`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners.get(browser).run('language.js');
      t.is(result.score, 0);
    }
  );

  test.serial(
    `Best practice / browser: ${browser} / We should be able to detect URLs with jsessionid`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners
        .get(browser)
        .run('url.js', 'url.html?jsessionid=ecdeed');
      t.is(result.score, 0);
    }
  );

  test.serial(
    `Best practice / browser: ${browser} / We should be able to know if we use more than 2 parameters on a page`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners
        .get(browser)
        .run('url.js', 'url.html?jleffe=ecdeed&hepp=hopp&left=right');
      t.is(result.score, 50);
    }
  );

  test.serial(
    `Best practice / browser: ${browser} / We should be able to know if a URL is too long`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners
        .get(browser)
        .run(
          'url.js',
          'url.html?long=thisisasuperlongurlthatyoureallyshouldavoidwhenyoucreateanewsitepleasedoitoritwillbreakyou'
        );
      t.is(result.score, 90);
    }
  );

  test.serial(
    `Best practice / browser: ${browser} / We should be able to know if a URL contains spaces`,
    async (t) => {
      t.timeout(60_000);
      const result = await runners
        .get(browser)
        .run('url.js', 'url.html?left=right%20hepp');
      t.is(result.score, 90);
    }
  );
}
