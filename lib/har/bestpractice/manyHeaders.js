'use strict';

const util = require('../util');

module.exports = {
  id: 'manyHeaders',
  title: 'Avoid use too many response headers',
  description: 'Avoid send too many response headers.',
  weight: 1,
  tags: ['bestpractice', 'headers'],
  processPage: function (page) {
    const offending = [];
    let score = 100;
    let advice = '';
    page.assets.forEach(function (asset) {
      const maxHeaders = 30;
      // Report responses with more than 30 headers
      if (Object.keys(asset.headers.response).length > maxHeaders) {
        offending.push(asset.url);
        score -= 1;
        advice +=
          util.shortURL(asset.url) +
          ' has ' +
          util.plural(Object.keys(asset.headers.response).length, 'header') +
          '.';
      }
    });
    return {
      score: Math.max(0, score),
      offending: offending,
      advice: advice
    };
  }
};
