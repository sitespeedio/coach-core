(function () {
  'use strict';

  const offending = [];
  const html = document.getElementsByTagName('html')[0];
  let score = 100;

  if ((html && html.getAttribute('amp-version')) || window.AMP) {
    score = 0;
  }

  return {
    id: 'amp',
    title: 'Avoid using AMP',
    description:
      "AMP was one of Google attempts to strengthen its monopoly in the Interente advertising market. You can read more about it here: https://storage.courtlistener.com/recap/gov.uscourts.nysd.564903/gov.uscourts.nysd.564903.152.0_1.pdf Using AMP you also share private user information with Google that your user hasn't agreed on sharing.",
    advice:
      score === 0
        ? 'The page is using AMP, that makes you share private user information with Google.'
        : '',
    score: score,
    weight: 10,
    offending: offending,
    tags: ['bestpractice']
  };
})();
