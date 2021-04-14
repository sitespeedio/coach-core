'use strict';

module.exports = {
  id: 'disableFLoCHeader',
  title:
    'Set a permission policy header that opt out your users being tracked in Chrome by FLoC.',
  description:
    'Googles new tracking method is called Federated Learning of Cohorts (FLoC) and it groups you based on your interests and demographics, derived from your browsing history, to enable creepy advertising and other content targeting without third-party cookies. You can avoid that by setting a Permissions-Policy header with the value of interest-cohort=(). See https://www.eff.org/deeplinks/2021/03/googles-floc-terrible-idea.',
  weight: 8,
  tags: ['headers', 'privacy'],
  processPage: function (page) {
    const offending = [];
    let score = 0;
    let advice = '';
    const finalUrl = page.finalUrl;
    page.assets.forEach(function (asset) {
      if (asset.url === finalUrl) {
        const headers = asset.headers.response;
        if (
          headers['permissions-policy'] &&
          headers['permissions-policy'].indexOf('interest-cohort=()') > -1
        ) {
          score = 100;
        } else {
          offending.push(asset.url);
        }
      }
    });
    if (score === 0) {
      advice =
        'Set a permission policy header that opt out Chrome for tracking what your users do on your site.';
    }
    return {
      score: score,
      offending: offending,
      advice: advice
    };
  }
};
