(function () {
  'use strict';

  const offending = [];
  const html = document.getElementsByTagName('html')[0];
  let score = 100;

  if ((html && html.getAttribute('amp-version')) || window.AMP) {
    score = 0;
  }

  return {
    id: 'ampPrivacy',
    title: 'Avoid including AMP',
    description:
      "You share share private user information with Google that your user hasn't agreed on sharing.",
    advice:
      score === 0
        ? 'The page is using AMP, that makes you share private user information with Google.'
        : '',
    score: score,
    weight: 8,
    offending: offending,
    tags: ['privacy']
  };
})();
