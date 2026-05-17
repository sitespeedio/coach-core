import * as util from '../util.js';
export default {
  id: 'mixedContent',
  title: 'Serve all responses on HTTPS (when you are on HTTPS)',
  description:
    'You need to make sure that if you are on HTTPS, all responses are on HTTPS so that the content served are secured.',
  weight: 7,
  severity: 'error',
  tags: ['privacy'],
  processPage: function (page) {
    const offending = [];
    let score = 100;
    let advice = '';
    const finalUrl = page.finalUrl;
    if (finalUrl.includes('https://')) {
      for (const asset of page.assets) {
        // Avoid catching redirects from http to https
        if (asset.url.includes('http://') && asset.url !== page.url) {
          score = 0;
          offending.push(asset.url);
        }
      }
    }
    if (score === 0) {
      advice =
        'You need to serve all responses on HTTPS. The page have ' +
        util.plural(offending.length, 'response') +
        ' using HTTP. That is a privacy and security risk.';
    }
    return {
      score: score,
      offending: offending,
      advice: advice
    };
  }
};
