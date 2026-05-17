(function (util) {
  'use strict';
  // Interaction to Next Paint (INP) is the Core Web Vital that replaced
  // First Input Delay in March 2024. It measures the latency of the
  // slowest user interaction (click, tap, keypress) on the page — from
  // input to the next paint that reflects the response.
  //
  // Synthetic tests rarely fire interactions, so this rule reports
  // whatever it can observe from PerformanceObserver buffered 'event'
  // entries. For accurate INP you really want real-user monitoring; the
  // advice text says so. The thresholds below match Google's published
  // p75 cutoffs (https://web.dev/articles/inp):
  //   good                <= 200 ms
  //   needs improvement   200–500 ms
  //   poor                > 500 ms
  let score = 100;
  let advice;
  const offending = [];
  const good = 200;
  const needImprovement = 500;

  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || !supported.includes('event')) {
    advice = 'Interaction to Next Paint is not supported in this browser.';
  } else {
    const observer = new PerformanceObserver(() => {});
    // durationThreshold filters out the chatter of trivial events; 40 ms
    // is the value web-vitals.js uses by default.
    try {
      observer.observe({
        type: 'event',
        buffered: true,
        durationThreshold: 40
      });
    } catch {
      observer.observe({ type: 'event', buffered: true });
    }
    const entries = observer.takeRecords();

    if (entries.length === 0) {
      advice =
        'No interactions were observed during this page load, so Interaction to Next Paint cannot be assessed in this snapshot. INP is best measured with real-user monitoring.';
    } else {
      // Group by interactionId — a single user interaction can produce
      // multiple events (pointerdown, pointerup, click), and the
      // interaction's "duration" is the max event duration in that
      // group. interactionId === 0 means the event isn't part of an
      // interaction (synthetic, scrolling, hover etc.); we ignore those.
      const byInteraction = {};
      for (const entry of entries) {
        const id = entry.interactionId;
        if (!id) continue;
        if (!byInteraction[id] || entry.duration > byInteraction[id].duration) {
          byInteraction[id] = entry;
        }
      }
      const interactions = Object.values(byInteraction);

      if (interactions.length === 0) {
        advice =
          'Events were observed but none were part of a real interaction (interactionId 0), so Interaction to Next Paint cannot be assessed.';
      } else {
        // Pick the slowest interaction. In real-user monitoring you'd
        // take the p75 across interactions; in synthetic with only a
        // handful of interactions the worst case is the most useful
        // signal.
        let worst = interactions[0];
        for (let i = 1; i < interactions.length; i++) {
          if (interactions[i].duration > worst.duration) {
            worst = interactions[i];
          }
        }
        const inp = Math.round(worst.duration);
        const tag = worst.target
          ? worst.target.cloneNode(false).outerHTML
          : worst.name;

        if (inp <= good) {
          advice = `Interaction to Next Paint is good ${util.ms(inp)}.`;
        } else if (inp <= needImprovement) {
          score = 80;
          advice = `Interaction to Next Paint can be improved ${util.ms(
            inp
          )}. It is in the Google Web Vitals needs-improvement range (slower than 200 ms). The slowest interaction was on ${worst.name}.`;
          offending.push(tag);
        } else {
          score = 0;
          advice = `Interaction to Next Paint is poor ${util.ms(
            inp
          )}. It is in the Google Web Vitals poor range (slower than 500 ms). The slowest interaction was on ${worst.name}. Look for long tasks on the main thread, expensive event handlers, or layout work triggered by the interaction.`;
          offending.push(tag);
        }
      }
    }
  }

  return {
    id: 'interactionToNextPaint',
    title: 'Have a fast Interaction to Next Paint',
    description:
      'Interaction to Next Paint (INP) is one of the Google Core Web Vitals — it replaced First Input Delay in March 2024 — and measures the latency of the slowest interaction with the page. To be fast according to Google, the p75 across all interactions should be under 200 ms, and over 500 ms is poor performance. INP is best measured with real-user monitoring; this rule reports what it can observe from the events that happened during the test.',
    advice: advice,
    score: Math.max(0, score),
    weight: 7,
    severity: 'error',
    offending: offending,
    tags: ['performance']
  };
})(util);
