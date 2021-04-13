'use strict';

const { getEntity } = require('third-party-web');

module.exports.getThirdParty = function (page) {
  const toolsByCategory = {};
  const offending = [];
  const byCategory = {};
  let thirdPartyTransferSizeBytes = 0;
  const thirdPartyAssetsByCategory = {};
  let company;
  try {
    company =
      page && page.url.indexOf('localhost') > -1
        ? undefined
        : getEntity(page.url);
  } catch (e) {
    // https://github.com/sitespeedio/sitespeed.io/issues/3043
  }

  let totalThirdPartyRequests = 0;
  for (let asset of page.assets) {
    let entity;
    try {
      entity =
        (asset && asset.url.indexOf('localhost') > -1) ||
        (asset && !asset.url.startsWith('http'))
          ? undefined
          : getEntity(asset.url);
    } catch (e) {
      continue;
    }
    if (entity !== undefined) {
      if (company && company.name === entity.name) {
        // Testing companies that themselves are a third party gives a high third party score
        // so we should remove the ones.
        continue;
      }
      totalThirdPartyRequests++;
      offending.push(asset.url);
      if (asset.transferSize) {
        thirdPartyTransferSizeBytes += asset.transferSize;
      }
      if (
        entity.name.indexOf('Google') > -1 ||
        entity.name.indexOf('Facebook') > -1 ||
        entity.name.indexOf('AMP') > -1 ||
        entity.name.indexOf('YouTube') > -1
      ) {
        if (!entity.categories.includes('survelliance')) {
          entity.categories.push('survelliance');
        }
      }
      for (let category of entity.categories) {
        if (!toolsByCategory[category]) {
          toolsByCategory[category] = {};
        }
        if (byCategory[category]) {
          byCategory[category] = byCategory[category] + 1;
          thirdPartyAssetsByCategory[category].push({
            url: asset.url,
            entity
          });
        } else {
          byCategory[category] = 1;
          thirdPartyAssetsByCategory[category] = [];
          thirdPartyAssetsByCategory[category].push({
            url: asset.url,
            entity
          });
        }
        if (toolsByCategory[category][entity.name]) {
          toolsByCategory[category][entity.name] += 1;
        } else {
          toolsByCategory[category][entity.name] = 1;
        }
      }
    }
  }
  return {
    thirdPartyTransferSizeBytes,
    totalThirdPartyRequests,
    toolsByCategory,
    byCategory,
    offending
  };
};
