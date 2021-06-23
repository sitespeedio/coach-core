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
    let headers = {},
      url,
      html,
      cookies = {},
      meta = {};

    for (let asset of page.assets) {
      Object.assign(headers, asset.headers.response);
      url = asset.url;
      html = asset.content ? asset.content : '';
      meta.generator =
        page.meta && page.meta.generator ? [page.meta.generator] : '';
    }

    for (let cookieName of page.cookieNames) {
      cookies[cookieName] = ['secret'];
    }

    const scripts = [];
    const jsAssets = page.assets.filter((asset) => asset.type === 'javascript');
    for (let asset of jsAssets) {
      scripts.push(asset.url);
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
