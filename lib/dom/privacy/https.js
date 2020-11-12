(function () {
  'use strict';

  const url = document.URL;
  let score = 100;
  let message = '';

  if (url.indexOf('https://') === -1) {
    score = 0;
    message =
      'What!! The page is not using HTTPS. Every unencrypted HTTP request reveals information about user’s behavior, read more about it at https://https.cio.gov/everything/. You can get a totally free SSL/TLS certificate from https://letsencrypt.org/.';
  }

  return {
    id: 'https',
    title: 'Serve your content securely',
    description:
      'A page should always use HTTPS (https://https.cio.gov/everything/). You also need that for HTTP/2. You can get your free SSL/TLC certificate from https://letsencrypt.org/.',
    advice: message,
    score: score,
    weight: 10,
    offending: [],
    tags: ['privacy']
  };
})();
