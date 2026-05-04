import * as util from '../util.js';

const SKIPPABLE_DOMAINS = [
  'www.google-analytics.com',
  'ssl.google-analytics.com',
  'analytics.twitter.com'
];

// One year in seconds — the cache lifetime modern best practice (and the
// HTTP/1.1 spec) recommends as the upper bound. For content-hashed URLs
// (e.g. /static/app.4af2.css) this is what `Cache-Control:
// max-age=31536000, immutable` is designed for.
const ONE_YEAR = 31536000;

function processAsset(asset) {
  if (SKIPPABLE_DOMAINS.indexOf(util.getHostname(asset.url)) > -1) {
    return 0;
  } else if (asset.expires >= ONE_YEAR) {
    return 0;
  } else if (asset.expires <= 0) {
    // this is caught in cacheHeaders so let's skip giving advice
    // about them
    return 0;
  } else {
    return 1;
  }
}

export default {
  id: 'cacheHeadersLong',
  title: 'Long cache headers is good',
  description:
    'Setting a cache header is good. Setting a long cache header (a year) is even better because the asset will stay in the browser cache across visits. For content-hashed URLs (e.g. app.4af2.css) you can safely use Cache-Control: max-age=31536000, immutable. For unversioned URLs that may change, use a revalidating strategy instead.',
  weight: 3,
  severity: 'info',
  tags: ['performance', 'server'],

  processPage: function (page) {
    let score = 100;
    let offending = [];
    page.assets.forEach(function (asset) {
      // Don't check the main page/document since it is common to not
      // cache that
      if (asset.url === page.finalUrl) {
        return;
      }
      let myScore = processAsset(asset);
      if (myScore > 0) {
        score -= myScore;
        offending.push(asset.url);
      }
    });

    return {
      score: Math.max(0, score),
      offending: offending,
      advice:
        score < 100
          ? 'The page has ' +
            util.plural(offending.length, 'request') +
            ' that have a shorter cache time than one year (but still a cache time).'
          : ''
    };
  }
};
