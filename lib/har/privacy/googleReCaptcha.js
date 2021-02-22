'use strict';
module.exports = {
  id: 'googleReCaptcha',
  title: 'Avoid using Google reCAPTCHA',
  description:
    'You should avoid using Google reCAPTCHA since it will share your users information with Google.',
  weight: 9,
  tags: ['privacy'],
  processPage: function (page) {
    const offending = [];
    let score = 100;
    let advice = '';

    page.assets.forEach(function (asset) {
      // Avoid catching redirects from http to https
      if (
        asset.url.indexOf('www.google.com/recaptcha/enterprise.js') > -1 ||
        asset.url.indexOf('www.google.com/recaptcha/api.js') > -1
      ) {
        score = 0;
        offending.push(asset.url);
      }
    });

    if (score === 0) {
      advice =
        'You share your user data with Google since you use Google reCAPTCHA.';
    }
    return {
      score: score,
      offending: offending,
      advice: advice
    };
  }
};
