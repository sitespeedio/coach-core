(function () {
  'use strict';
  // The LCP image is the one element whose loading speed correlates
  // most directly with the LCP metric, so two priority hints matter on
  // it specifically:
  //
  //   * fetchpriority="high" tells the browser to fetch the image with
  //     high priority instead of the default ("auto" — chosen by
  //     internal heuristics that often guess wrong on hero images).
  //   * loading="lazy" must NOT be set — a lazy LCP image is delayed
  //     until intersection observation says it's near the viewport,
  //     which by definition delays the LCP metric.
  //
  // The largestContentfulPaint rule scores the metric itself; this rule
  // scores the priority hints applied to the element behind the metric.
  // Splitting them lets a consumer tell apart "the hero image is slow"
  // from "the hero image's hints are wrong" — different remediations.
  let score = 100;
  let advice = '';
  const offending = [];

  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || !supported.includes('largest-contentful-paint')) {
    advice =
      'Largest Contentful Paint is not supported in this browser, so the LCP image hints cannot be assessed.';
  } else {
    const observer = new PerformanceObserver(() => {});
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    const entries = observer.takeRecords();
    if (entries.length === 0) {
      advice = 'No LCP entries were observed during this snapshot.';
    } else {
      const entry = entries.at(-1);
      const el = entry.element;
      if (!el || el.tagName !== 'IMG') {
        // The LCP element is text or some other non-image. Nothing to
        // score here; this rule is image-specific.
        advice =
          'The LCP element is not an image, so this rule does not apply.';
      } else {
        const tag = el.cloneNode(false).outerHTML;
        const fetchpriority = (el.fetchPriority || '').toLowerCase();
        const loading = (el.loading || '').toLowerCase();

        if (loading === 'lazy') {
          score -= 60;
          advice +=
            'The LCP image has loading="lazy", which delays its download until the browser thinks it is near the viewport — and so directly delays the LCP metric. Remove loading="lazy" from the LCP image. ';
          offending.push(tag);
        }
        if (fetchpriority !== 'high') {
          score -= 30;
          advice +=
            'The LCP image is missing fetchpriority="high". Adding it tells the browser to fetch the image with high priority instead of the default heuristic (which often deprioritises hero images that are loaded after the HTML has been parsed). ';
          offending.push(tag);
        }
      }
    }
  }

  return {
    id: 'lcpImageHints',
    title: 'Apply the right priority hints to the LCP image',
    description:
      'When the Largest Contentful Paint element is an image, the browser priority hints applied to that element directly affect the LCP metric. The image must NOT be loading="lazy" (that defers the fetch until near-viewport, which is the opposite of what an LCP image needs) and SHOULD be fetchpriority="high" (so the browser fetches it with high priority instead of guessing). https://web.dev/articles/fetch-priority',
    advice: advice.trim(),
    score: Math.max(0, score),
    weight: 5,
    severity: 'warn',
    offending: offending,
    tags: ['performance', 'image']
  };
})();
