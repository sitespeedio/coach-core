'use strict';
const fs = require('fs');
const path = require('path');
const Wappalyzer = require('wappalyzer-core');

const categories = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './../categories.json'))
);

/*
let technologies = {}

for (const index of Array(27).keys()) {
  const character = index ? String.fromCharCode(index + 96) : '_'

  technologies = {
    ...technologies,
    ...JSON.parse(
      fs.readFileSync(
        path.resolve(`${__dirname}./../technologies/${character}.json`)
      )
    ),
  }
}
*/
// Initialize an empty object to store technologies
let technologies = {};

// Define the length of the array we will iterate over
const arrayLength = 27;

for (const index of Array(arrayLength).keys()) {
  // Determine the character representation for this index
  // If index is 0, use '_', else use ASCII character corresponding to (index + 96)
  const character = index ? String.fromCharCode(index + 96) : '_';

  const filePath = path.resolve(
    `${__dirname}/../../technologies/${character}.json`
  );

  const fileContent = fs.readFileSync(filePath);
  const technologiesToAdd = JSON.parse(fileContent);

  // Merge the parsed content into our technologies object
  technologies = {
    ...technologies,
    ...technologiesToAdd
  };
}

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
    } catch {
      return {};
    }
  }
};
