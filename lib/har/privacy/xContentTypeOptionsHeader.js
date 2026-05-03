'use strict';

module.exports = {
  id: 'xContentTypeOptionsHeader',
  title:
    'Set X-Content-Type-Options: nosniff to stop the browser from MIME-sniffing the response.',
  description:
    'X-Content-Type-Options: nosniff prevents browsers from interpreting files as a different MIME type than what is declared in the Content-Type header. This blocks a class of cross-site scripting and content-type confusion attacks and should be set on every response. https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options',
  weight: 4,
  tags: ['headers', 'privacy'],
  processPage: function (page) {
    const offending = [];
    let score = 0;
    let advice = '';
    const finalUrl = page.finalUrl;
    page.assets.forEach(function (asset) {
      if (asset.url === finalUrl) {
        const headers = asset.headers.response;
        const value =
          headers['x-content-type-options'] &&
          headers['x-content-type-options'][0];
        if (value && value.toLowerCase() === 'nosniff') {
          score = 100;
        } else {
          offending.push(asset.url);
        }
      }
    });
    if (score === 0) {
      advice =
        'Set X-Content-Type-Options: nosniff on the document response to prevent MIME-sniffing.';
    }
    return {
      score: score,
      offending: offending,
      advice: advice
    };
  }
};
