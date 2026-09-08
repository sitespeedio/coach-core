import test from 'ava';
import har from '../../help/har.js';

// Rewrite the Content-Type of every image response in a HAR clone, so we can
// exercise "delivered as JPEG" and "delivered as WebP from the same .jpg URL"
// against the same fixture.
function withImageContentType(clone, contentType) {
  for (const entry of clone.log.entries) {
    const header = entry.response.headers.find(
      (h) => h.name.toLowerCase() === 'content-type'
    );
    if (header && header.value.startsWith('image/')) {
      header.value = contentType;
      entry.response.content.mimeType = contentType;
    }
  }
  return clone;
}

async function cloneFixture() {
  return JSON.parse(
    JSON.stringify(await har.harFromTestFile('www.nytimes.com.har'))
  );
}

test('Modern image formats / flags images delivered as JPEG or PNG', async (t) => {
  const result = await har.firstAdviceForTestFile('www.nytimes.com.har');
  const advice = result.performance.adviceList.modernImageFormats;
  t.is(advice.score, 0);
  t.true(advice.offending.length > 0);
  t.regex(advice.advice, /as JPEG, PNG or GIF/);
});

test('Modern image formats / a .jpg URL delivered as WebP is not flagged', async (t) => {
  // The URLs in this fixture keep their .jpg / .png extensions — only the
  // Content-Type changes, which is exactly Accept-based negotiation.
  const clone = withImageContentType(await cloneFixture(), 'image/webp');
  const result = await har.firstAdviceForHar(clone);
  const advice = result.performance.adviceList.modernImageFormats;
  t.is(advice.score, 100);
  t.deepEqual(advice.offending, []);
  t.is(advice.advice, '');
});

test('Modern image formats / AVIF counts as modern too', async (t) => {
  const clone = withImageContentType(await cloneFixture(), 'image/avif');
  const result = await har.firstAdviceForHar(clone);
  t.is(result.performance.adviceList.modernImageFormats.score, 100);
});

test('Modern image formats / Content-Type parameters and casing are ignored', async (t) => {
  const clone = withImageContentType(await cloneFixture(), 'Image/WebP; charset=utf-8');
  const result = await har.firstAdviceForHar(clone);
  t.is(result.performance.adviceList.modernImageFormats.score, 100);
});

test('Modern image formats / scores the share of legacy images', async (t) => {
  const clone = await cloneFixture();
  let seen = 0;
  for (const entry of clone.log.entries) {
    const header = entry.response.headers.find(
      (h) => h.name.toLowerCase() === 'content-type'
    );
    if (header && header.value.startsWith('image/')) {
      // Every other image gets a modern Content-Type.
      const contentType = seen++ % 2 === 0 ? 'image/webp' : 'image/jpeg';
      header.value = contentType;
      entry.response.content.mimeType = contentType;
    }
  }
  t.true(seen > 0, 'the fixture should contain images to rewrite');
  const advice = (await har.firstAdviceForHar(clone)).performance.adviceList
    .modernImageFormats;
  // pagexray classifies a narrower asset set than the raw HAR entries (no
  // favicons, no SVG), so assert the mix rather than an exact count.
  t.true(advice.score > 0 && advice.score < 100);
  t.true(advice.offending.length > 0);
  t.true(advice.offending.every((url) => typeof url === 'string'));
});

test('Modern image formats / images without a Content-Type are not judged', async (t) => {
  const clone = await cloneFixture();
  for (const entry of clone.log.entries) {
    entry.response.headers = entry.response.headers.filter(
      (h) =>
        !(
          h.name.toLowerCase() === 'content-type' &&
          h.value.startsWith('image/')
        )
    );
  }
  const advice = (await har.firstAdviceForHar(clone)).performance.adviceList
    .modernImageFormats;
  t.is(advice.score, 100);
  t.deepEqual(advice.offending, []);
});

test('Modern image formats / tracking pixels are not flagged', async (t) => {
  // A 42 byte GIF beacon is an image only by content type. Re-encoding it
  // saves nothing, so it should not appear as advice.
  const clone = await cloneFixture();
  clone.log.entries.push({
    startedDateTime: '2026-09-08T10:00:01.000Z',
    time: 10,
    request: {
      method: 'GET',
      url: 'https://tracker.example.com/pixel.gif?id=1',
      httpVersion: 'HTTP/2',
      headers: [],
      queryString: [],
      cookies: [],
      headersSize: -1,
      bodySize: -1
    },
    response: {
      status: 200,
      statusText: 'OK',
      httpVersion: 'HTTP/2',
      headers: [{ name: 'content-type', value: 'image/gif' }],
      cookies: [],
      content: { size: 42, mimeType: 'image/gif' },
      redirectURL: '',
      headersSize: -1,
      bodySize: 42
    },
    cache: {},
    timings: { blocked: 0, dns: 0, connect: 0, send: 0, wait: 5, receive: 5 },
    pageref: clone.log.pages[0].id
  });
  withImageContentType(clone, 'image/webp');
  // withImageContentType rewrote the beacon too, so put it back.
  const beacon = clone.log.entries.at(-1);
  beacon.response.headers[0].value = 'image/gif';
  beacon.response.content.mimeType = 'image/gif';

  const advice = (await har.firstAdviceForHar(clone)).performance.adviceList
    .modernImageFormats;
  t.is(advice.score, 100);
  t.false(advice.offending.some((url) => url.includes('pixel.gif')));
});
