(function() {
  'use strict';
  let advice = '';
  let score = 0;
  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || supported.indexOf('layout-shift') === -1) {
    advice = 'Layout Shift is not supported in this browser';
  } else {
    const observer = new PerformanceObserver(() => {});
    observer.observe({ type: 'layout-shift', buffered: true });
    for (let entry of observer.takeRecords()) {
      score += entry.value;
    }
  }

  return {
    id: 'layoutShift',
    title: 'Cumulative Layout Shift',
    description:
      'Cumulative Layout Shift measures the sum total of all individual layout shift scores for every unexpected layout shift that occurs during the entire lifespan of the page. A layout shift occurs any time a visible element changes its position from one rendered frame to the next. ',
    advice: advice,
    score: Math.round(Math.max(0, 100 - score * 100)),
    weight: 8,
    offending: [],
    tags: ['bestpractice']
  };
})();
