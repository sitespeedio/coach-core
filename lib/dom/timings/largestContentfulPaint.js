(function () {
  'use strict';
  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || !supported.includes('largest-contentful-paint')) {
    return;
  }
  const observer = new PerformanceObserver(() => {});
  observer.observe({ type: 'largest-contentful-paint', buffered: true });
  const entries = observer.takeRecords();
  if (entries.length > 0) {
    const largestEntry = entries.at(-1);
    return {
      duration: largestEntry.duration,
      id: largestEntry.id,
      url: largestEntry.url,
      loadTime: Number(largestEntry.loadTime.toFixed(0)),
      renderTime: Number(
        Math.max(largestEntry.renderTime, largestEntry.loadTime).toFixed(0)
      ),
      size: largestEntry.size,
      startTime: Number(largestEntry.startTime.toFixed(0)),
      tagName: largestEntry.element ? largestEntry.element.tagName : ''
    };
  } else return;
})();
