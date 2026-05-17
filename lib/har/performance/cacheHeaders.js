import * as util from '../util.js';

const SKIPPABLE_DOMAINS = new Set([
  'www.google-analytics.com',
  'ssl.google-analytics.com',
  'analytics.twitter.com'
]);

export default {
  id: 'cacheHeaders',
  title: 'Avoid extra requests by setting cache headers',
  description:
    "The easiest way to make your page fast is to avoid doing requests to the server. Setting a cache header on your server response will tell the browser that it doesn't need to download the asset again during the configured cache time! Always try to set a cache time if the content doesn't change for every request.",
  weight: 6,
  severity: 'warn',
  tags: ['performance', 'server'],

  processPage: function (page) {
    let score = 100;
    let offending = [];
    let saveSize = 0;
    for (const asset of page.assets) {
      // Don't check the main page/document since it is common to not
      // cache that
      if (asset.url === page.finalUrl) {
        continue;
      }

      if (
        !SKIPPABLE_DOMAINS.has(util.getHostname(asset.url)) &&
        asset.expires <= 0 &&
        asset.method === 'GET'
      ) {
        // TODO we should check if the asset is set private, think the most logical would be to exclude them
        score -= 10;
        saveSize += asset.transferSize;
        offending.push(asset.url);
      }
    }

    return {
      score: Math.max(0, score),
      offending: offending,
      advice:
        score < 100
          ? 'The page has ' +
            util.plural(offending.length, 'request') +
            " that are missing a cache time. Configure a cache time so the browser doesn't need to download them every time. It will save " +
            util.formatBytes(saveSize) +
            ' the next access.'
          : ''
    };
  }
};
