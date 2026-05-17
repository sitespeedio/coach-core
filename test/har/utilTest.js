import test from 'ava';
import * as util from '../../lib/har/util.js';

test('Test HAR util functions / Categorize connection types H2 as HTTP/2 and nothing else', (t) => {
  const page = {};
  page.httpType = 'h2';
  t.true(util.isHTTP2(page));
  page.httpType = 'h1';
  t.false(util.isHTTP2(page));
  page.httpType = 'h3-29';
  t.true(util.isHTTP3(page));
  t.false(util.isHTTP2(page));
});

test('Test HAR util functions / Get the right hostname', (t) => {
  let url = 'https://www.sitespeed.io/hepp.php';
  t.is(util.getHostname(url), 'www.sitespeed.io');

  url = 'https://www.sitespeed.io:8080/hepp.php';
  t.is(util.getHostname(url), 'www.sitespeed.io');

  url = 'https://sitespeed.io';
  t.is(util.getHostname(url), 'sitespeed.io');
});

test('Test HAR util functions / Format bytes for readability', (t) => {
  let bytes = 1200000;
  t.is(util.formatBytes(bytes), '1.2 MB');

  bytes = 120000;
  t.is(util.formatBytes(bytes), '120 kB');
});
