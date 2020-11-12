(function () {
  'use strict';

  const offending = [];
  let score = 100;

  if (window.FB) {
    score = 0;
  }

  return {
    id: 'facebook',
    title: 'Avoid including Facebook',
    description:
      "You share share private user information with Facebook that your user hasn't agreed on sharing.",
    advice:
      score === 0
        ? 'The page gets content from Facebook. That means you share your users private information with Facebook.'
        : '',
    score: score,
    weight: 8,
    offending: offending,
    tags: ['privacy']
  };
})();
