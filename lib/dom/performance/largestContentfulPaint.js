(function (util) {
  'use strict';
  let score = 100;
  let advice = '';
  const offending = [];
  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || supported.indexOf('largest-contentful-paint') === -1) {
    advice = 'Largest contentful paint is not supported in this browser';
  } else {
    const observer = new PerformanceObserver(() => {});
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    const entries = observer.takeRecords();
    if (entries.length > 0) {
      const largestEntry = entries[entries.length - 1];
      const good = 2500;
      const needImprovement = 4000;

      const lcp = {
        url: largestEntry.url,
        renderTime: Number(
          Math.max(largestEntry.renderTime, largestEntry.loadTime).toFixed(0)
        ),
        tagName: largestEntry.element ? largestEntry.element.tagName : '',
        tag: largestEntry.element
          ? largestEntry.element.cloneNode(false).outerHTML
          : ''
      };
      if (lcp.renderTime <= good) {
        `Largest contentful paint is good ${util.ms(lcp.renderTime)}.`;
      } else if (lcp.renderTime <= needImprovement) {
        score = 80;
        advice = `Largest contentful paint can be improved ${util.ms(
          lcp.renderTime
        )}. It is in the Google Web Vitals needs improvement range, slower than 2.5 seconds.`;
        offending.push(lcp.url || lcp.tag);
      } else if (lcp.renderTime > needImprovement) {
        score = 0;
        advice = `Largest contentful paint is poor ${util.ms(
          lcp.renderTime
        )}. It is in the Google Web Vitals poor range, slower than 4.5 seconds.`;
        offending.push(lcp.url || lcp.tag);
      }

      if (lcp.tagName === 'IMG') {
        if (largestEntry.element.importance != 'high') {
          score -= 5;
          advice +=
            ' You can add importance="high" to the image to increase the load priority that is rolling out soon in Chrome.';
        }
        if (largestEntry.element.loading === 'lazy') {
          score -= 20;
          advice +=
            ' The image is lazy loaded using the lazy attribute, you should avoid that on the LCP image.';
        }
      }
    }
  }

  return {
    id: 'largestContentfulPaint',
    title: 'Have a fast largest contentful paint',
    description:
      'Largest contentful paint is one of Google Web Vitals and reports the render time of the largest image or text block visible within the viewport, relative to when the page first started loading. To be fast according to Google, it needs to render before 2.5 seconds and results over 4 seconds is poor performance.',
    advice: advice,
    score: Math.max(0, score),
    weight: 7,
    offending: offending,
    tags: ['performance']
  };
})(util);
