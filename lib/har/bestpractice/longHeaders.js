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
      for (let header of asset.headers.response) {
        if (header.value.length > maxHeaderLength) {
          offending.push(asset.url);
          score -= 1;
          advice +=
            util.shortURL(asset.url) +
            ' has ' +
            header.name +
            ' that is ' +
            header.value.length +
            ' characters long. ';
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
