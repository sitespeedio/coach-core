import * as util from '../util.js';

export default {
  id: 'longHeaders',
  title: 'Do not send too long headers',
  description: 'Do not send response headers that are too long.',
  weight: 1,
  severity: 'info',
  tags: ['bestpractice', 'header'],
  processPage: function (page) {
    const offending = [];
    let score = 100;
    let advice = '';
    for (const asset of page.assets) {
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
    }

    return {
      score: Math.max(0, score),
      offending: offending,
      advice: advice
    };
  }
};
