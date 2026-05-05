export default {
  id: 'crossOriginResourcePolicyHeader',
  title:
    'Set a Cross-Origin-Resource-Policy header to limit who may embed the page.',
  description:
    'Cross-Origin-Resource-Policy (CORP) is a per-response opt-in that tells the browser which origins are allowed to embed the resource. It blocks cross-origin or cross-site no-cors embedding (img, script, iframe, etc.) and is one of the building blocks of cross-origin isolation. https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy',
  weight: 3,
  severity: 'info',
  tags: ['headers', 'privacy'],
  processPage: function (page) {
    const offending = [];
    let score = 0;
    let advice = '';
    const finalUrl = page.finalUrl;
    page.assets.forEach(function (asset) {
      if (asset.url === finalUrl) {
        const headers = asset.headers.response;
        if (headers['cross-origin-resource-policy']) {
          score = 100;
        } else {
          offending.push(asset.url);
        }
      }
    });
    if (score === 0) {
      advice =
        'Set a Cross-Origin-Resource-Policy header (same-origin, same-site or cross-origin) on the document response to limit who may embed it.';
    }
    return {
      score: score,
      offending: offending,
      advice: advice
    };
  }
};
