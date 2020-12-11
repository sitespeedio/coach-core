'use strict';
const fs = require('fs');
const path = require('path');
const Wappalyzer = require('wappalyzer-core');

const { technologies, categories } = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './../technologies.json'))
);

Wappalyzer.setTechnologies(technologies);
Wappalyzer.setCategories(categories);

module.exports = {
  id: 'technology',
  processPage: function (page) {
    let headers = [],
      url,
      html,
      cookies = {},
      meta = {};

    for (let asset of page.assets) {
      if (asset.url === page.finalUrl) {
        for (let header of asset.headers.response) {
          if (headers[header.name]) {
            headers[header.name].push(header.value);
          } else {
            headers[header.name] = [header.value];
          }
        }
        url = asset.url;
        html = asset.content ? asset.content : '';
        meta.generator =
          page.meta && page.meta.generator ? [page.meta.generator] : '';
      }
    }

    for (let cookieName of page.cookieNames) {
      cookies[cookieName] = 'hepp';
    }

    const scripts = [];
    const jsAssets = page.assets.filter((asset) => asset.type === 'javascript');
    for (let asset of jsAssets) {
      const filename =
        asset.url.indexOf('/') > -1
          ? asset.url.substring(asset.url.lastIndexOf('/') + 1)
          : asset.url;
      scripts.push(filename);
    }

    try {
      const detections = Wappalyzer.analyze({
        url,
        meta,
        headers,
        scripts,
        cookies,
        html
      });
      return Wappalyzer.resolve(detections);
    } catch (e) {
      return {};
    }
  }
};
