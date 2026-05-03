import { createRequire } from 'node:module';
import * as util from './util.js';
import * as thirdParty from './thirdParty.js';
import * as severity from '../severity.js';

const require = createRequire(import.meta.url);
const packageInfo = require('../../package.json');

export function runAdvice(pages, harAdvicesByCategory, domAdvice, options) {
  options = options || {};
  const all = [];
  const results = {};
  for (let page of pages) {
    for (let category of Object.keys(harAdvicesByCategory)) {
      const adviceList = harAdvicesByCategory[category];
      if (category !== 'info') {
        const allAdvice = adviceList.filter(validateAdvice);
        results[category] = {
          adviceList: {}
        };
        for (let advice of allAdvice) {
          const result = advice.processPage(page, domAdvice, options);
          results[category].adviceList[advice.id] = {
            id: advice.id,
            title: advice.title,
            description: advice.description,
            advice: result.advice,
            weight: advice.weight,
            severity: advice.severity || severity.fromWeight(advice.weight),
            tags: advice.tags,
            score: result.score,
            offending: result.offending
          };
        }
      }
    }
    const thirdParties = thirdParty.getThirdParty(page);
    const withoutCategories = {
      advice: {
        info: {
          pageTransferSize: util.formatBytes(page.transferSize),
          pageContentSize: util.formatBytes(page.contentSize),
          pageRequests: page.requests,
          pageDomains: page.totalDomains,
          pageContentTypes: page.contentTypes,
          pageExpireStats: util.human(
            page.expireStats,
            util.prettyPrintSeconds
          ),
          pageLastModifiedStats: util.human(
            page.lastModifiedStats,
            util.prettyPrintSeconds
          ),
          pageCookies: page.cookieStats,
          thirdParty: {
            requestsByCategory: thirdParties.byCategory,
            requestsByTool: thirdParties.toolsByCategory
          }
        }
      },
      version: packageInfo.version
    };
    for (let category of Object.keys(results)) {
      withoutCategories.advice[category] = results[category];
    }

    const infoFromHAR = harAdvicesByCategory['info'];
    for (let info of infoFromHAR) {
      withoutCategories.advice['info'][info.id] = info.processPage(
        page,
        domAdvice,
        options
      );
    }

    all.push(withoutCategories);
  }
  return all;
}

function validateAdvice(advice) {
  if (!advice.id) {
    throw new Error('Advice is missing an id: ', JSON.stringify(advice));
  }
  if (!(typeof advice.processPage === 'function')) {
    throw new Error('Advice ' + advice.id + ' needs a processPage function.');
  }
  return true;
}
