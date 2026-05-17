(function (util) {
  'use strict';
  // Below-the-fold images should use loading="lazy" so they don't
  // compete with the initial render for bandwidth and decode time. The
  // LCP rule already flags lazy-loading on the LCP image (which would
  // be wrong); this rule covers the other side — images that are below
  // the fold and could benefit from being lazy but aren't.
  //
  // We treat anything whose top is more than one viewport below the
  // current scroll position as below-the-fold. That's a deliberate
  // overshoot: images just below the fold often need to render before
  // the user reaches them, so we only flag the ones that are clearly
  // out of sight.
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight || 0;
  const foldCutoff = viewportHeight * 2;

  const offending = [];
  let belowFoldCount = 0;
  const images = document.querySelectorAll('img');

  for (let i = 0, len = images.length; i < len; i++) {
    const img = images[i];
    if (!img.src && !img.currentSrc) {
      continue;
    }
    let rect;
    try {
      rect = img.getBoundingClientRect();
    } catch {
      continue;
    }
    // Skip non-rendered images (display:none etc.) — they have zero
    // height and aren't competing for anything.
    if (rect.height === 0 && rect.width === 0) {
      continue;
    }
    if (rect.top < foldCutoff) {
      continue;
    }
    belowFoldCount++;
    if ((img.loading || '').toLowerCase() !== 'lazy') {
      offending.push(util.getAbsoluteURL(img.currentSrc || img.src));
    }
  }

  let score = 100;
  let advice = '';
  if (offending.length > 0) {
    const ratio = offending.length / Math.max(belowFoldCount, 1);
    score = Math.round(100 * (1 - ratio));
    advice =
      'The page has ' +
      util.plural(offending.length, 'below-the-fold image') +
      ' without loading="lazy". Add loading="lazy" so the browser defers downloading and decoding them until the user scrolls them into view.';
  }

  return {
    id: 'lazyLoadingImages',
    title: 'Lazy-load below-the-fold images',
    description:
      'Adding loading="lazy" to an <img> tells the browser not to download or decode it until it is close to the viewport. For images that the user may never see (deep in the page, behind a tab, in a footer carousel), this saves bandwidth and main-thread time during initial render. The LCP image and any image in the initial viewport should NOT be lazy-loaded — that delays the first paint. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#loading',
    advice: advice,
    score: score,
    weight: 4,
    severity: 'warn',
    offending: offending,
    tags: ['performance', 'image']
  };
})(util);
