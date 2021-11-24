(function () {
  'use strict';

  const offending = [];
  let advice = 'There is no Layout Shift on the page.';
  let score = 0;
  let max = 0;
  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || supported.indexOf('layout-shift') === -1) {
    advice = 'Layout Shift is not supported in this browser';
  } else {
    // See https://web.dev/layout-instability-api
    // https://github.com/mmocny/web-vitals/wiki/Snippets-for-LSN-using-PerformanceObserver#max-session-gap1s-limit5s
    let curr = 0;
    let firstTs = Number.NEGATIVE_INFINITY;
    let prevTs = Number.NEGATIVE_INFINITY;
    const observer = new PerformanceObserver(() => {});
    observer.observe({ type: 'layout-shift', buffered: true });
    const list = observer.takeRecords();
    for (let entry of list) {
      if (entry.hadRecentInput) {
        continue;
      }
      if (entry.startTime - firstTs > 5000 || entry.startTime - prevTs > 1000) {
        firstTs = entry.startTime;
        curr = 0;
      }
      prevTs = entry.startTime;
      curr += entry.value;
      max = Math.max(max, curr);
    }
    if (max <= 0.1) {
      score = 100;
    } else if (max > 0.25) {
      score = 0;
      advice = `You have a poor cumulative layout shift score (${max.toFixed(
        4
      )}). It is in the Google Web Vitals poor range, with a shift higher than 0.25. You should manually check the filmstrip or video and check if it will affect the user.`;
    } else {
      score = 50;
      advice = `You have a cumulative layout shift score (${max.toFixed(
        4
      )}) that needs improvements. It is in the Google Web Vitals needs improvement range, shift higher than 0.1. You should manually check the filmstrip or video and check if it will affect the user.`;
    }
  }

  return {
    id: 'cumulativeLayoutShift',
    title: 'Cumulative Layout Shift',
    description:
      'Cumulative Layout Shift measures the sum total of all individual layout shift scores for unexpected layout shift that occur. The metric is measuring visual stability by quantify how often users experience unexpected layout shifts. It is one of Google Web Vitals.',
    advice,
    score,
    weight: 8,
    offending,
    tags: ['bestpractice']
  };
})();
