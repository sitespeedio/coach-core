import * as thirdParty from '../thirdParty.js';

export default {
  id: 'thirdparty',
  processPage: function (page) {
    const thirdParties = thirdParty.getThirdParty(page);
    return thirdParties;
  }
};
