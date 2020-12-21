'use strict';
const util = require('../util');
module.exports = {
  id: 'thirdPartyCookies',
  title: 'Avoid third party cookies that is used to track the user.',
  description:
    'Third party cookies are used to track the user. They are automatically blocked in Safari and Firefox.',
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
      advice = `The page sets ${util.plural(
        thirdPartyCookies.length,
        'third party cookie'
      )}.`;
    }

    return {
      score: Math.max(0, score),
      offending: offending,
      advice: advice
    };
  }
};
