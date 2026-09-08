import * as util from '../util.js';

// AVIF and WebP routinely deliver 25-50% smaller files than JPEG and PNG at
// the same perceived quality. This lives on the HAR side rather than in a DOM
// rule because only the HAR knows what was actually delivered: the response
// Content-Type is recorded for every asset whatever its origin, while a page
// script can read PerformanceResourceTiming.contentType for same-origin
// responses only. A URL extension is not the format either - an image
// pipeline negotiating on Accept answers a .jpg URL with image/webp, and
// judging that by the URL reports a site as broken while it is doing the
// right thing.
const LEGACY_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/bmp'
]);

// Below this there is nothing to win: a re-encode saves a few bytes at best,
// and AVIF / WebP container overhead can make a tiny GIF bigger. It is also
// where tracking pixels live - a 42 byte beacon is an image only by content
// type, and "convert your tracking pixel to WebP" is not advice worth giving.
const MIN_SIZE_BYTES = 1024;

function getSize(asset) {
  // transferSize is -1 in HARs that do not record it (DevTools exports),
  // so fall back to the decoded body size before giving up.
  for (const size of [asset.contentSize, asset.transferSize]) {
    if (typeof size === 'number' && size > 0) {
      return size;
    }
  }
  return 0;
}

function getContentType(asset) {
  const headers = (asset.headers && asset.headers.response) || {};
  const value = headers['content-type'] && headers['content-type'][0];
  // Strip parameters and normalise: 'Image/JPEG; charset=x' -> 'image/jpeg'.
  return value ? value.split(';')[0].trim().toLowerCase() : '';
}

export default {
  id: 'modernImageFormats',
  title: 'Serve images in modern formats (AVIF, WebP)',
  description:
    'AVIF and WebP routinely deliver 25-50% smaller files than JPEG and PNG at the same perceived quality, and every browser version still under support understands at least one of them. Ship modern formats through a <picture> element with <source type="image/avif"> / "image/webp" entries, from a content-negotiating image pipeline that answers with AVIF / WebP when the client accepts it, or straight from modern URLs. This checks the Content-Type actually delivered, so an image negotiated on Accept counts as modern however its URL is spelled. https://web.dev/articles/serve-images-webp',
  weight: 4,
  severity: 'warn',
  tags: ['performance', 'image'],

  processPage: function (page) {
    const offending = [];
    let legacy = 0;
    let total = 0;

    for (const asset of page.assets) {
      if (asset.type !== 'image') {
        continue;
      }
      const contentType = getContentType(asset);
      // No Content-Type means we cannot say what was delivered, so we say
      // nothing rather than guessing from the URL.
      if (!contentType) {
        continue;
      }
      // A known-tiny image has nothing to gain from a modern format. An
      // unknown size still gets judged, so we do not lose real images to a
      // HAR that records no sizes at all.
      const size = getSize(asset);
      if (size > 0 && size < MIN_SIZE_BYTES) {
        continue;
      }
      total++;
      if (LEGACY_CONTENT_TYPES.has(contentType)) {
        legacy++;
        offending.push(asset.url);
      }
    }

    let advice = '';
    if (legacy > 0) {
      advice =
        'The page delivers ' +
        util.plural(legacy, 'image') +
        ' (out of ' +
        total +
        ') as JPEG, PNG or GIF. Convert them to AVIF or WebP, either in your image pipeline or by negotiating on the Accept header, and expect 25-50% smaller files at the same quality.';
    }

    return {
      score: total > 0 ? Math.round(100 * (1 - legacy / total)) : 100,
      offending: offending,
      advice: advice
    };
  }
};
