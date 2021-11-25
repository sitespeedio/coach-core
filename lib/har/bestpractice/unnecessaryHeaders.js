'use strict';

const util = require('../util');

module.exports = {
  id: 'unnecessaryHeaders',
  title: 'Avoid unnecessary headers',
  description:
    "Do not send headers that you don't need. We look for p3p, cache-control and max-age, pragma, server and x-frame-options headers. Have a look at Andrew Betts - Headers for Hackers talk as a guide https://www.youtube.com/watch?v=k92ZbrY815c or read https://www.fastly.com/blog/headers-we-dont-want.",
  weight: 1,
  tags: ['bestpractice', 'header'],
  processPage: function (page) {
    const offending = [];
    const p3pHeaders = [];
    const cacheHeaders = [];
    const pragmaHeaders = [];
    const xframeHeaders = [];
    const serverHeaders = [];
    let score = 100;
    let advice = '';
    page.assets.forEach(function (asset) {
      const headers = asset.headers.response;
      if (headers.p3p) {
        offending.push(asset.url);
        p3pHeaders.push(asset.url);
        score -= 1;
      }

      if (
        headers.expires &&
        headers['cache-control'] &&
        headers['cache-control'][0].indexOf('max-age' > -1)
      ) {
        // You don't need to set both expires and cache-control: max-age. Use just one!
        offending.push(asset.url);
        cacheHeaders.push(asset.url);
        score -= 1;
      }

      if (headers.pragma && headers.pragma[0].indexOf('no-cache') > -1) {
        offending.push(asset.url);
        pragmaHeaders.push(asset.url);
        score -= 1;
      }

      if (headers.server) {
        offending.push(asset.url);
        serverHeaders.push(asset.url);
        score -= 1;
      }

      if (
        headers['x-frame-options'] &&
        headers['x-frame-options'][0] === 'sameorigin'
      ) {
        offending.push(asset.url);
        xframeHeaders.push(asset.url);
        score -= 1;
      }
    });

    if (p3pHeaders.length > 0) {
      advice +=
        'There are ' +
        util.plural(p3pHeaders.length, 'response') +
        ' that sets a p3p header. ';
    }
    if (cacheHeaders.length > 0) {
      advice +=
        'There are ' +
        util.plural(cacheHeaders.length, 'response') +
        ' that sets both a max-age and expires header. ';
    }
    if (pragmaHeaders.length > 0) {
      advice +=
        'There are ' +
        util.plural(pragmaHeaders.length, 'response') +
        ' that sets a pragma no-cache header (that is a request header). ';
    }
    if (xframeHeaders.length > 0) {
      advice +=
        'There are ' +
        util.plural(xframeHeaders.length, 'response') +
        ' that sets a x-frame-options:sameorigin header. ';
    }
    if (serverHeaders.length > 0) {
      advice +=
        'There are ' +
        util.plural(serverHeaders.length, 'response') +
        ' that sets a server header. ';
    }

    return {
      score: Math.max(0, score),
      offending: offending,
      advice: advice
    };
  }
};
