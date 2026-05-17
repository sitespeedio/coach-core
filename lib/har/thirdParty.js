import thirdPartyWeb from 'third-party-web';

const { getEntity } = thirdPartyWeb;

export function getThirdParty(page) {
  const toolsByCategory = {};
  const offending = [];
  const byCategory = {};
  let thirdPartyTransferSizeBytes = 0;
  const thirdPartyAssetsByCategory = {};
  let company;
  try {
    company =
      page && page.url.includes('localhost') ? undefined : getEntity(page.url);
  } catch {
    // https://github.com/sitespeedio/sitespeed.io/issues/3043
  }

  let totalThirdPartyRequests = 0;
  for (let asset of page.assets) {
    let entity;
    try {
      entity =
        (asset && asset.url.includes('localhost')) ||
        (asset && !asset.url.startsWith('http'))
          ? undefined
          : getEntity(asset.url);
    } catch {
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
      let categories = entity.categories;
      if (
        (entity.name.includes('Google') ||
          entity.name.includes('Facebook') ||
          entity.name.includes('AMP') ||
          entity.name.includes('YouTube')) &&
        !categories.includes('surveillance')
      ) {
        categories = categories.concat('surveillance');
      }
      for (let category of categories) {
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
}
