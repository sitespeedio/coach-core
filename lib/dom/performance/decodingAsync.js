(function (util) {
  'use strict';
  // `decoding="async"` lets the browser decode an image off the main
  // thread, which keeps interaction (and other rendering work)
  // responsive while the image is being processed. The default is
  // `decoding="auto"` which leaves the choice to the browser; setting
  // it explicitly to `async` is the safest hint for non-LCP images.
  //
  // We only flag images that don't have any decoding hint at all. We
  // don't flag `decoding="sync"` (the author may have a reason, e.g. a
  // first-paint image where they want to ensure synchronous decode) and
  // we don't flag `decoding="auto"` (the explicit default).
  const offending = [];
  const images = document.querySelectorAll('img');
  let unhinted = 0;
  let total = 0;

  for (let i = 0, len = images.length; i < len; i++) {
    const img = images[i];
    if (!img.src && !img.currentSrc) {
      continue;
    }
    total++;
    if (!img.hasAttribute('decoding')) {
      unhinted++;
      offending.push(util.getAbsoluteURL(img.currentSrc || img.src));
    }
  }

  // Score linearly with the proportion of images that lack the hint.
  // 0% unhinted → 100, 100% unhinted → 0. We don't want to fail a page
  // that has a single un-hinted image hard, so this stays gentle.
  let score = 100;
  let advice = '';
  if (total > 0 && unhinted > 0) {
    const ratio = unhinted / total;
    score = Math.round(100 * (1 - ratio));
    advice =
      'The page has ' +
      util.plural(unhinted, 'image') +
      ' (out of ' +
      total +
      ') without a decoding hint. Add decoding="async" to non-critical images so the browser can decode them off the main thread.';
  }

  return {
    id: 'decodingAsync',
    title: 'Add decoding="async" to non-critical images',
    description:
      'Setting decoding="async" on an <img> tells the browser it can decode the image off the main thread, which keeps the page responsive to user interactions while images are being processed. The default ("auto") leaves the choice to the browser. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#decoding',
    advice: advice,
    score: score,
    weight: 2,
    severity: 'info',
    offending: offending,
    tags: ['performance', 'image']
  };
})(util);
