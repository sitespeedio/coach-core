'use strict';
const util = require('../util');
module.exports = {
  id: 'responseOk',
  title: 'Avoid missing and error requests',
  description:
    'Your page should never request assets that return a 400 or 500 error. These requests are never cached. If that happens something is broken. Please fix it.',
  weight: 7,
  tags: ['performance', 'server'],

  processPage: function (page) {
    let score = 100;
    let offending = [];
    let offendingCodes = {};
    let advice = '';
    page.assets.forEach(function (asset) {
      if (asset.status >= 400) {
        offending.push(asset.url);
        score -= 10;
        if (offendingCodes[asset.status]) {
          offendingCodes[asset.status] += 1;
        } else {
          offendingCodes[asset.status] = 1;
        }
      }
    });

    if (score < 100) {
      advice =
        'The page has ' +
        util.plural(offending.length, 'error response') +
        '. ';
      Object.keys(offendingCodes).forEach(function (errorCode) {
        advice +=
          'The page has ' +
          util.plural(offendingCodes[errorCode], 'response') +
          ' with code ' +
          errorCode +
          '. ';
      });
    }

    return {
      score: Math.max(0, score),
      offending: offending,
      advice: advice
    };
  }
};
