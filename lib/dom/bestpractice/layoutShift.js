(function () {
  'use strict';
  const offending = [];
  let advice = 'There is no Layout Shift on the page.';
  let score = 0;
  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || supported.indexOf('layout-shift') === -1) {
    advice = 'Layout Shift is not supported in this browser';
  } else {
    const observer = new PerformanceObserver(() => {});
    observer.observe({ type: 'layout-shift', buffered: true });
    for (let entry of observer.takeRecords()) {
      score += entry.value;
      for (let shift of entry.sources) {
        if (shift.node && shift.node.currentSrc) {
          offending.push(shift.node.currentSrc);
        } else if (shift.node) {
          offending.push(shift.node.nodeName + ' ' + shift.node.className);
        }
      }
    }
  }

  return {
    id: 'layoutShift',
    title: 'Cumulative Layout Shift',
    description:
      'Cumulative Layout Shift measures the sum total of all individual layout shift scores for every unexpected layout shift that occurs during the entire lifespan of the page. A layout shift occurs any time a visible element changes its position from one rendered frame to the next.',
    advice:
      score > 0
        ? 'You have elements that shift. You should manually test your page and check if it will affect the user.'
        : advice,
    score: Math.round(Math.max(0, 100 - score * 100)),
    weight: 8,
    offending,
    tags: ['bestpractice']
  };
})();
