(function () {
  'use strict';

  const offending = [];
  let score = 0;
  let totalDuration = 0;
  let advice = 'The page do not have any CPU Long Tasks.';

  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || supported.indexOf('longtask') === -1) {
    advice = 'The Long Task API is not supported in this browser.';
  } else {
    const longTaskObserver = new PerformanceObserver(() => {});
    longTaskObserver.observe({ type: 'longtask', buffered: true });
    for (let entry of longTaskObserver.takeRecords()) {
      score += 20;
      totalDuration += entry.duration;
      offending.push(entry.name);
    }
  }

  return {
    id: 'longTasks',
    title: 'Avoid CPU Long Tasks',
    description:
      'Long CPU tasks locks the thread. To the user this is commonly visible as a "locked up" page where the browser is unable to respond to user input; this is a major source of bad user experience on the web today. However the CPU Long Task is depending on the computer/phones actual CPU speed, so you should measure this on the same type of the device that your user is using.',
    advice:
      offending.length > 0
        ? 'The page has ' +
          offending.length +
          ' CPU long tasks with the total of ' +
          totalDuration.toFixed(0) +
          ' ms'
        : advice,
    score: Math.max(0, 100 - score),
    weight: 8,
    offending: offending,
    tags: ['performance', 'js']
  };
})();
