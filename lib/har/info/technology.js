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
        for (let header of Object.keys(asset.headers.response)) {
          headers[header] = [asset.headers.response.header];
        }
        url = asset.url;
        html = asset.response ? asset.response.content : '';
        meta.generator =
          page.meta && page.meta.generator ? [page.meta.generator] : '';
      }
    }

    for (let asset of page.assets) {
      if (asset.headers.response.cookie) {
        const cookieNamnAndValue = asset.headers.response.cookie.split(';');
        for (let cookie of cookieNamnAndValue.split('=')) {
          cookies[cookie[0]] = cookie[1];
        }
      }
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

    const detections = Wappalyzer.analyze({
      url,
      meta,
      headers,
      scripts,
      cookies,
      html
    });
    return Wappalyzer.resolve(detections);
  }
};
