'use strict';
const thirdParty = require('../thirdParty');

module.exports = {
  id: 'thirdparty',
  processPage: function (page) {
    const thirdParties = thirdParty.getThirdParty(page);
    return thirdParties;
  }
};
