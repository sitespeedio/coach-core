(function () {
  'use strict';

  // A correct viewport meta tag is the baseline for responsive layout on
  // mobile. Without it the browser uses a desktop-width fallback (typically
  // 980px) and scales the page down, which makes text unreadable. Locking
  // user-scalable=no or maximum-scale=1 also breaks pinch-to-zoom and is an
  // accessibility regression, so we flag those values too.
  let content = '';
  const metas = document.getElementsByTagName('meta');
  for (let i = 0, len = metas.length; i < len; i++) {
    const name = metas[i].getAttribute('name');
    if (name && name.toLowerCase() === 'viewport') {
      content = (metas[i].getAttribute('content') || '').trim();
      break;
    }
  }

  let score = 100;
  let advice = '';
  const lower = content.toLowerCase();

  if (content.length === 0) {
    score = 0;
    advice =
      'The page is missing a viewport meta tag. Add <meta name="viewport" content="width=device-width, initial-scale=1"> so the browser lays the page out at the device width.';
  } else {
    if (lower.indexOf('width=device-width') === -1) {
      score -= 50;
      advice +=
        'The viewport meta tag does not contain width=device-width, the browser may use a desktop-width fallback. ';
    }
    if (
      lower.indexOf('user-scalable=no') > -1 ||
      lower.indexOf('user-scalable=0') > -1
    ) {
      score -= 30;
      advice +=
        'The viewport meta tag disables user-scalable, which breaks pinch-to-zoom and is an accessibility problem. ';
    }
    if (/maximum-scale\s*=\s*(0?\.\d+|1(\.0+)?)\b/.test(lower)) {
      score -= 20;
      advice +=
        'The viewport meta tag sets maximum-scale to 1 or less, which prevents the user from zooming in. Remove it. ';
    }
  }

  return {
    id: 'viewport',
    title: 'Set a sensible viewport meta tag',
    description:
      'The viewport meta tag tells the browser how to lay out the page on small screens. Without it (or without width=device-width) the page is rendered at a desktop fallback width and scaled down, which makes text unreadable on mobile. Disabling zoom (user-scalable=no, maximum-scale<=1) is also an accessibility regression. https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag',
    advice: advice.trim(),
    score: Math.max(0, score),
    weight: 5,
    severity: 'warn',
    offending: [],
    tags: ['bestpractice']
  };
})();
