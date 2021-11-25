'use strict';

const util = require('../util');
const types = ['html', 'plain', 'json', 'javascript', 'css', 'svg'];

function processAsset(asset) {
  if (types.indexOf(asset.type) > -1) {
    const headers = asset.headers.response;
    const encoding = headers['content-encoding']
      ? headers['content-encoding'][0]
      : '';
    if (
      encoding !== 'gzip' &&
      encoding !== 'br' &&
      encoding !== 'deflate' &&
      asset.contentSize > 2000
    ) {
      return 10;
    }
  }
  return 0;
}

module.exports = {
  id: 'compressAssets',
  title: 'Always compress text content',
  description:
    "In the early days of the Internet there were browsers that didn't support compressing (gzipping) text content. They do now. Make sure you compress HTML, JSON, JavaScript, CSS and SVG. It will save bytes for the user; making the page load faster and use less bandwith. ",
  weight: 8,
  tags: ['performance', 'server'],

  processPage: function (page) {
    let score = 100;
    let offending = [];
    page.assets.forEach(function (asset) {
      let myScore = processAsset(asset);
      if (myScore > 0) {
        score -= myScore;
        offending.push({
          url: asset.url,
          transferSize: asset.transferSize,
          contentSize: asset.contentSize
        });
      }
    });

    return {
      score: Math.max(0, score),
      offending: offending,
      advice:
        score < 100
          ? 'The page has ' +
            util.plural(offending.length, 'request') +
            ' that are served uncompressed. You could save a lot of bytes by sending them compressed instead.'
          : ''
    };
  }
};
