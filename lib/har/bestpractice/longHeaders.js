'use strict';

const util = require('../util');

module.exports = {
  id: 'longHeaders',
  title: 'Do not send too long headers',
  description: 'Do not send response headers that are too long.',
  weight: 1,
  tags: ['bestpractice', 'header'],
  processPage: function (page) {
    const offending = [];
    let score = 100;
    let advice = '';
    page.assets.forEach(function (asset) {
      const maxHeaderLength = 600;
      for (let headerName of Object.keys(asset.headers.response)) {
        for (let headerValue of asset.headers.response[headerName]) {
          if (headerValue.length > maxHeaderLength) {
            offending.push(asset.url);
            score -= 1;
            advice +=
              util.shortURL(asset.url) +
              ' has a header ' +
              headerName +
              ' that is ' +
              headerValue.length +
              ' characters long. ';
          }
        }
      }
    });

    return {
      score: Math.max(0, score),
      offending: offending,
      advice: advice
    };
  }
};
