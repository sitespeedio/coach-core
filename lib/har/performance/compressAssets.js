import * as util from '../util.js';
const types = new Set(['html', 'plain', 'json', 'javascript', 'css', 'svg']);

function processAsset(asset) {
  if (types.has(asset.type)) {
    const headers = asset.headers.response;
    const encoding = headers['content-encoding']
      ? headers['content-encoding'][0]
      : '';
    if (
      encoding !== 'gzip' &&
      encoding !== 'br' &&
      encoding !== 'deflate' &&
      encoding !== 'zstd' &&
      asset.contentSize > 2000
    ) {
      return 10;
    }
  }
  return 0;
}

export default {
  id: 'compressAssets',
  title: 'Always compress text content',
  description:
    "In the early days of the Internet there were browsers that didn't support compressing (gzipping) text content. They do now. Make sure you compress HTML, JSON, JavaScript, CSS and SVG. It will save bytes for the user; making the page load faster and use less bandwith. ",
  weight: 8,
  severity: 'warn',
  tags: ['performance', 'server'],

  processPage: function (page) {
    let score = 100;
    let offending = [];
    for (const asset of page.assets) {
      let myScore = processAsset(asset);
      if (myScore > 0) {
        score -= myScore;
        offending.push({
          url: asset.url,
          transferSize: asset.transferSize,
          contentSize: asset.contentSize
        });
      }
    }

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
