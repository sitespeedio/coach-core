'use strict';

module.exports = {
  id: 'thirdPartyCookies',
  title: 'Avoid third party cookies.',
  description: '',
  weight: 6,
  tags: ['cookies', 'privacy'],
  processPage: function (page) {
    const offending = [];
    let score = 100;
    let advice = '';
    const thirdPartyCookies = page.cookieNamesThirdParties;
    for (let cookie of thirdPartyCookies) {
      offending.push(cookie.domain);
      score = -10;
    }

    if (score < 100) {
      advice = `The page uses ${thirdPartyCookies.length} third party cookies.`;
    }

    return {
      score: Math.max(0, score),
      offending: offending,
      advice: advice
    };
  }
};