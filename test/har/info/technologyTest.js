import assert from 'node:assert';
import har from '../../help/har.js';
import * as api from '../../../lib/index.js';

describe('Check for technology', function() {
  it('We shave the right amount of technologies', function() {
    return har.firstAdviceForTestFile('withHtmlContent.har').then(result => {
      assert.strictEqual(
        result.info.technology.length,
        8
      );
    });
  });

  it('Does not pick up technologies from third-party asset headers', function() {
    // The fixture above is a real WordPress page; the previous
    // implementation merged response headers from every asset on the
    // page into the bag Wappalyzer scanned, which was the source of
    // false-positive AWS / S3 attributions on pages that pull in
    // third-party assets hosted on AWS. Make sure none of the cloud-
    // provider technologies leak in from third-party headers here.
    return har.firstAdviceForTestFile('withHtmlContent.har').then(result => {
      const names = result.info.technology.map(t => t.name);
      const cloudProviders = ['Amazon Web Services', 'Amazon S3', 'Cloudflare'];
      for (const provider of cloudProviders) {
        assert.ok(
          !names.includes(provider),
          'Did not expect ' + provider + ' to be detected on a WordPress page; found: ' + names.join(', ')
        );
      }
    });
  });

  it('Does not detect S3 from a Content-Security-Policy allowlist', async function() {
    // Sites with a permissive CSP often whitelist third-party hosts that
    // are *allowed* to be embedded, not technologies the page itself uses
    // (Wikipedia for instance allows `inaturalist-open-data.s3.amazonaws.com`
    // for embedded species photos). Wappalyzer's S3 rule matches
    // `s3[^ ]*amazonaws.com` anywhere in the CSP header, so without
    // stripping CSP from the input the page would be flagged as using S3.
    const baseHar = await har.harFromTestFile('withHtmlContent.har');
    const cspClonedHar = JSON.parse(JSON.stringify(baseHar));
    cspClonedHar.log.entries[0].response.headers.push({
      name: 'content-security-policy',
      value: "default-src 'self' inaturalist-open-data.s3.amazonaws.com"
    });
    const advice = await api.getHarAdvice();
    const result = await api.analyseHar(cspClonedHar, advice);
    const names = result[0].advice.info.technology.map(t => t.name);
    assert.ok(
      !names.includes('Amazon S3'),
      'Should not have detected Amazon S3 from a CSP allowlist; found: ' + names.join(', ')
    );
  });

});
