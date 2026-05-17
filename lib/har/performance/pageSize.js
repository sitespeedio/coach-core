import * as util from '../util.js';

export default {
  id: 'pageSize',
  title: "Total page size shouldn't be too big",
  description:
    'Avoid having pages that have a transfer size over the wire of more than 3 MB (desktop) and 2 MB (mobile) because heavy pages hurt performance and are expensive for users on metered connections. Reference: HTTP Archive median page weight in 2024 was around 2.7 MB desktop / 2.4 MB mobile, so this rule fires when a page is above the modern median.',
  weight: 3,
  severity: 'warn',
  tags: ['performance', 'mobile'],
  processPage: function (page, domAdvice, options) {
    let sizeLimit = options.mobile ? 2_000_000 : 3_000_000;
    if (page.transferSize > sizeLimit) {
      const offending = [];
      for (const asset of page.assets) {
        offending.push({
          url: asset.url,
          transferSize: asset.transferSize,
          contentSize: asset.contentSize
        });
      }
      return {
        score: 0,
        offending,
        advice:
          'The page total transfer size is ' +
          util.formatBytes(page.transferSize) +
          ', which is more than the coach limit of ' +
          util.formatBytes(sizeLimit) +
          '. That is ' +
          (page.transferSize > 5_000_000 ? 'insane' : 'really big') +
          ' and you need to make it smaller.'
      };
    }
    return {
      score: 100,
      offending: [],
      advice: ''
    };
  }
};
