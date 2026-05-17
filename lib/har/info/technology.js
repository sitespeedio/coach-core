import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Wappalyzer from '../../technologies/wappalyzer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const categories = JSON.parse(
  readFileSync(resolve(__dirname, './../categories.json'))
);

// Initialize an empty object to store technologies
let technologies = {};

// Define the length of the array we will iterate over
const arrayLength = 27;

for (const index of Array.from({ length: arrayLength }).keys()) {
  // Determine the character representation for this index
  // If index is 0, use '_', else use ASCII character corresponding to (index + 96)
  const character = index ? String.fromCodePoint(index + 96) : '_';

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

    // Pick the HTML document for `url` and `html`. The previous loop
    // overwrote both on every iteration and ended up using the last
    // asset's URL and body — usually a tracker or a JS payload, not the
    // page document. Wappalyzer URL- and HTML-pattern detections then
    // matched against the wrong input: the test fixture for instance
    // missed ZURB Foundation entirely because the HTML body it scanned
    // was a JS file from later in the loop.
    const mainAsset =
      page.assets.find((asset) => asset.type === 'html') || page.assets[0];
    if (mainAsset) {
      url = mainAsset.url;
      html = mainAsset.content || '';
    }
    meta.generator =
      page.meta && page.meta.generator ? [page.meta.generator] : '';

    // Aggregating response headers across every asset is the right
    // shape for Wappalyzer — `Via: cloudflare` on a real CDN-served
    // asset legitimately tells us the site uses Cloudflare, an actual
    // `Server: AmazonS3` on an S3-hosted image legitimately tells us
    // they're using S3. The class of false positive we want to avoid
    // here is the Content-Security-Policy header, which describes what
    // sources the browser is *permitted* to load, not what the page
    // actually uses. Wappalyzer regex-matches patterns like
    // `s3[^ ]*amazonaws.com` anywhere in the header value, so a benign
    // CSP allowlist for an embedded third-party (e.g. Wikipedia's CSP
    // listing `inaturalist-open-data.s3.amazonaws.com` to permit
    // embedded species photos) gets attributed to the page as if it
    // ran on S3. Strip CSP headers from every asset — they're never a
    // reliable detection signal.
    for (let asset of page.assets) {
      const response = (asset.headers && asset.headers.response) || {};
      for (const name of Object.keys(response)) {
        if (!/^content-security-policy/i.test(name)) {
          headers[name] = response[name];
        }
      }
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
