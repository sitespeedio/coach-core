(function () {
  'use strict';

  const max = 60;
  const title = document.title;
  let score = 100;
  let message = '';

  if (title.length === 0) {
    message = 'The page is missing a title.';
    score = 0;
  } else if (title.length > max) {
    message =
      'The title is too long by ' +
      (title.length - max) +
      ' characters. The recommended max is ' +
      max;
    score = 50;
  }

  return {
    id: 'pageTitle',
    title: 'Page title',
    description:
      'Use a title to make the page more relevant to search engines.',
    advice: message,
    score: score,
    weight: 5,
    offending: [],
    tags: ['bestpractice']
  };
})();
