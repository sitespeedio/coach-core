(function () {
  'use strict';

  const offending = [];
  let score = 100;

  if (window.FingerprintJS || window.Fingerprint2) {
    score = 0;
  }

  return {
    id: 'fingerprint',
    title: 'Do not fingerprint your user.',
    description:
      'Fingerprinting consists of collecting different kinds of information about the user with the goal of building a unique "fingerprint" for them. Different types of fingerprinting are used on the web by trackers. Browser fingerprinting use characteristics specific to the browser of the user, relying on the fact that the chance of another user having the exact same browser set-up is fairly small if there are a large enough number of variables to track',
    advice:
      score === 0
        ? 'The page uses https://fingerprintjs.com to fingerprint the user.'
        : '',
    score: score,
    weight: 8,
    offending: offending,
    tags: ['privacy']
  };
})();
