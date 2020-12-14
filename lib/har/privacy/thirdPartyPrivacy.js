'use strict';

const util = require('../util');
const thirdParty = require('../thirdParty');

module.exports = {
  id: 'thirdPartyPrivacy',
  title: 'Do not share user data with third parties.',
  description:
    'Using third party requests shares user information with that third party. Please avoid that! The project https://github.com/patrickhulce/third-party-web is used to categorize first/third party requests.',
  weight: 5,
  tags: ['privacy'],
  processPage: function (page) {
    const thirdParties = thirdParty.getThirdParty(page);

    const firstPartyRequests =
      page.assets.length - thirdParties.totalThirdPartyRequests || 0;
    const thirdPartyRequests = thirdParties.totalThirdPartyRequests || 0;
    const thirdPartySize = util.formatBytes(
      thirdParties.thirdPartyTransferSizeBytes
    );

    const thirdPartyPercent =
      thirdPartyRequests > 0
        ? (thirdPartyRequests / (firstPartyRequests + thirdPartyRequests)) * 100
        : 0;

    let score = 100 - Math.round(thirdPartyPercent);
    let advice = '';
    if (thirdPartyPercent === 100) {
      advice =
        'The page has 100% of third party requests! Something is probably wrong? Verify that you test the right page.';
    } else {
      advice =
        'The page has ' +
        Math.round(thirdPartyPercent) +
        '% requests that are 3rd party (' +
        thirdPartyRequests +
        ' requests with a size of ' +
        thirdPartySize +
        ').';
    }

    if (
      thirdParties.byCategory['survelliance'] &&
      thirdParties.byCategory['survelliance'] > 0
    ) {
      score = 0;
      advice +=
        ' The page also have request to companies that harvest data from users and do not respect users privacy (see https://en.wikipedia.org/wiki/Surveillance_capitalism). ';
    }

    const doNotInclude = 'other cdn ';
    for (let category of Object.keys(thirdParties.byCategory)) {
      if (doNotInclude.indexOf(category) === -1) {
        advice +=
          ' The page do ' +
          util.plural(
            thirdParties.byCategory[category],
            category + ' request'
          ) +
          ' and uses ' +
          util.plural(
            Object.keys(thirdParties.toolsByCategory[category]).length,
            category + ' tool'
          ) +
          '.';
      }
    }

    return {
      score: Math.max(0, score),
      offending: thirdParties.offending,
      advice: advice
    };
  }
};
