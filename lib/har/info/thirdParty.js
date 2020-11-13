'use strict';
const thirdParty = require('../thirdParty');

module.exports = {
  id: 'thidparty',
  processPage: function (page) {
    const thirdParties = thirdParty.getThirdParty(page);
    return thirdParties;
  }
};
