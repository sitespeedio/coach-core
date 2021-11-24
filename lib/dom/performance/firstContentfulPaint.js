(function (util) {
  'use strict';
  let score = 100;
  let advice = '';
  const good = 1800;
  const needImprovement = 3000;

  const fcp = performance.getEntriesByName('first-contentful-paint')[0]
    .startTime;
  if (fcp <= good) {
    `First contentful paint is good ${util.ms(fcp)}.`;
  } else if (fcp <= needImprovement) {
    score = 50;
    advice = `First contentful paint can be improved (${util.ms(
      fcp
    )}). It is in the Google Web Vitals needs improvement range, slower than 1.8 seconds.`;
  } else {
    score = 0;
    advice = `First contentful paint is poor (${util.ms(
      fcp
    )}). It is in the Google Web Vitals poor range, slower than 3 seconds.`;

    let t = window.performance.getEntriesByType('navigation')[0];
    if (t) {
      if (Number(t.responseStart.toFixed(0)) > 1000) {
        advice += `The page has a high time to first byte (TTFB) ${util.ms(
          t.responseStart
        )} that you should look into to improve first contentful paint.`;
      }
    }
  }

  return {
    id: 'firstContentfulPaint',
    title: 'Have a fast first contentful paint',
    description:
      'The First Contentful Paint (FCP) metric measures the time from when the page starts loading to when any part of the page content is rendered on the screen. For this metric, "content" refers to text, images (including background images), <svg> elements, or non-white <canvas> elements.',
    advice: advice,
    score: Math.max(0, score),
    weight: 7,
    offending: [],
    tags: ['performance']
  };
})(util);
