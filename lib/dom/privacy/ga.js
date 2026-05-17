(function () {
  'use strict';

  const offending = [];
  let score = 100;

  // Detect classic Google Analytics (analytics.js / window.ga) and
  // Google Analytics 4 (gtag.js, which exposes window.gtag and a dataLayer
  // populated with a 'config' command for a G-XXXXXXXXXX measurement id).
  const hasClassicGA = !!(globalThis.ga && globalThis.ga.create);
  const hasGA4 =
    typeof globalThis.gtag === 'function' &&
    Array.isArray(globalThis.dataLayer) &&
    globalThis.dataLayer.some(function (entry) {
      return (
        entry &&
        entry[0] === 'config' &&
        typeof entry[1] === 'string' &&
        entry[1].indexOf('G-') === 0
      );
    });

  if (hasClassicGA || hasGA4) {
    score = 0;
  }

  return {
    id: 'ga',
    title: 'Avoid using Google Analytics',
    description:
      "Google Analytics share private user information with Google that your user hasn't agreed on sharing.",
    advice:
      score === 0
        ? 'The page is using Google Analytics meaning you share your users private information with Google. You should use analytics that care about user privacy, something like https://matomo.org.'
        : '',
    score: score,
    weight: 8,
    severity: 'warn',
    offending: offending,
    tags: ['privacy']
  };
})();
