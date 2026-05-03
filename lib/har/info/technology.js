import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Wappalyzer from 'wappalyzer-core';

const __dirname = dirname(fileURLToPath(import.meta.url));

const categories = JSON.parse(
  readFileSync(resolve(__dirname, './../categories.json'))
);

// Initialize an empty object to store technologies
let technologies = {};

// Define the length of the array we will iterate over
const arrayLength = 27;

for (const index of Array(arrayLength).keys()) {
  // Determine the character representation for this index
  // If index is 0, use '_', else use ASCII character corresponding to (index + 96)
  const character = index ? String.fromCharCode(index + 96) : '_';

  const filePath = resolve(`${__dirname}/../../technologies/${character}.json`);

  const fileContent = readFileSync(filePath);
  const technologiesToAdd = JSON.parse(fileContent);

  // Merge the parsed content into our technologies object
  technologies = {
    ...technologies,
    ...technologiesToAdd
  };
}

Wappalyzer.setTechnologies(technologies);
Wappalyzer.setCategories(categories);

export default {
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
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      return {};
    }
  }
};
