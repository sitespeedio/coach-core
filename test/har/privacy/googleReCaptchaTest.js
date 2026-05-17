import test from 'ava';
import har from '../../help/har.js';

test('Google reCAPTCHA / does not flag a page without reCAPTCHA', async (t) => {
  const result = await har.firstAdviceForTestFile('referrerPolicy.har');
  const advice = result.privacy.adviceList.googleReCaptcha;
  t.is(advice.score, 100);
  t.is(advice.offending.length, 0);
});

test('Google reCAPTCHA / flags a page that loads recaptcha/api.js', async (t) => {
  const base = await har.harFromTestFile('referrerPolicy.har');
  const clone = JSON.parse(JSON.stringify(base));
  const recaptchaEntry = JSON.parse(JSON.stringify(clone.log.entries[0]));
  recaptchaEntry.request.url = 'https://www.google.com/recaptcha/api.js';
  clone.log.entries.push(recaptchaEntry);
  const result = await har.firstAdviceForHar(clone);
  const advice = result.privacy.adviceList.googleReCaptcha;
  t.is(advice.score, 0);
  t.true(advice.offending.length >= 1);
});

test('Google reCAPTCHA / also flags the Enterprise variant', async (t) => {
  const base = await har.harFromTestFile('referrerPolicy.har');
  const clone = JSON.parse(JSON.stringify(base));
  const recaptchaEntry = JSON.parse(JSON.stringify(clone.log.entries[0]));
  recaptchaEntry.request.url =
    'https://www.google.com/recaptcha/enterprise.js?render=foo';
  clone.log.entries.push(recaptchaEntry);
  const result = await har.firstAdviceForHar(clone);
  const advice = result.privacy.adviceList.googleReCaptcha;
  t.is(advice.score, 0);
});
