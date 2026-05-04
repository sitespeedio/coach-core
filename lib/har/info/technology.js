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
      url = '',
      html = '',
      cookies = {},
      meta = {};

    // Wappalyzer expects a single document — the page itself, not every
    // asset on the page. Iterating over `page.assets` here merged
    // response headers from every third-party request (analytics,
    // beacons, S3-hosted images, …) into the bag Wappalyzer scans, so
    // headers like `Server: AmazonS3` or `x-amz-*` from a third-party
    // asset got attributed to the page. URL and HTML body were also
    // overwritten on every iteration and ended up being whatever the
    // last asset in the loop was, not the page document.
    //
    // Pick the HTML document specifically and analyse only that.
    const mainAsset =
      page.assets.find((asset) => asset.type === 'html') || page.assets[0];
    if (mainAsset) {
      const responseHeaders =
        (mainAsset.headers && mainAsset.headers.response) || {};
      // Strip Content-Security-Policy headers — they describe what sources
      // the browser is *permitted* to load, not what the site actually
      // uses. Wappalyzer regex-matches patterns like `s3[^ ]*amazonaws.com`
      // anywhere in the header value, so a benign CSP allowlist entry for
      // an embedded third-party (e.g. Wikipedia listing
      // `inaturalist-open-data.s3.amazonaws.com` to allow embedded species
      // photos) gets attributed to the page as if it ran on S3. The
      // technologies that legitimately need CSP signals to be detected
      // (about 80 entries) all have other signals — cookies, x-amz-*
      // headers, recognisable script URLs — that are unaffected here.
      for (const name of Object.keys(responseHeaders)) {
        if (!/^content-security-policy/i.test(name)) {
          headers[name] = responseHeaders[name];
        }
      }
      url = mainAsset.url;
      html = mainAsset.content || '';
    }
    meta.generator =
      page.meta && page.meta.generator ? [page.meta.generator] : '';

    for (let cookieName of page.cookieNames) {
      cookies[cookieName] = ['secret'];
    }

    // Script URLs are still gathered across the page — Wappalyzer
    // recognises specific filenames (`jquery-3.x.min.js`,
    // `react-dom.production.min.js`, …) so the full set is the right
    // input here, just not for headers/url/html.
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
