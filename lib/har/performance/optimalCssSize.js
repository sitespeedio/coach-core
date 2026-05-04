import * as util from '../util.js';

// Each render-blocking CSS file delays first paint until it has
// downloaded, parsed and applied. Smaller is faster, and a single CSS
// response above ~25 KB is usually a sign of mixed critical and
// non-critical styles being shipped together — split out the critical
// rules and lazy-load the rest.
const TRANSFER_LIMIT = 25000;

export default {
  id: 'optimalCssSize',
  title: 'Make each CSS response small',
  description:
    'Render-blocking CSS holds up the first paint until it has fully downloaded, parsed and applied, so smaller CSS files mean a faster start. Split your CSS into a small critical bundle inlined or eagerly loaded, with the rest lazy-loaded.',
  weight: 3,
  severity: 'info',
  tags: ['performance', 'css'],

  processPage: function (page) {
    let cssAssets = page.assets.filter((asset) => asset.type === 'css');
    let score = 100;
    let advice = '';
    let offending = [];

    cssAssets.forEach(function (asset) {
      if (asset.transferSize > TRANSFER_LIMIT) {
        score -= 10;
        offending.push({
          url: asset.url,
          transferSize: asset.transferSize,
          contentSize: asset.contentSize
        });
        advice +=
          asset.url +
          ' size is ' +
          util.formatBytes(asset.transferSize) +
          ' (' +
          asset.transferSize +
          ') and that is bigger than the limit of ' +
          util.formatBytes(TRANSFER_LIMIT) +
          '. ';
      }
    });

    if (score < 100) {
      advice +=
        'Try to keep each CSS response under ' +
        util.formatBytes(TRANSFER_LIMIT) +
        '.';
    }

    if (score < 0) {
      score = 0;
    }

    return {
      score,
      offending,
      advice
    };
  }
};
