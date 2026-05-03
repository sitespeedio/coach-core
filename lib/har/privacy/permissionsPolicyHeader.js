export default {
  id: 'permissionsPolicyHeader',
  title:
    'Set a Permissions-Policy header to control which browser features the page can use.',
  description:
    'The Permissions-Policy response header (the successor to Feature-Policy) lets a site explicitly opt in or out of powerful browser features such as camera, microphone, geolocation, payment and clipboard. Setting a strict policy reduces the attack surface and limits what embedded third parties can do. https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy',
  weight: 4,
  severity: 'warn',
  tags: ['headers', 'privacy'],
  processPage: function (page) {
    const offending = [];
    let score = 0;
    let advice = '';
    const finalUrl = page.finalUrl;
    page.assets.forEach(function (asset) {
      if (asset.url === finalUrl) {
        const headers = asset.headers.response;
        if (headers['permissions-policy'] || headers['feature-policy']) {
          score = 100;
        } else {
          offending.push(asset.url);
        }
      }
    });
    if (score === 0) {
      advice =
        'Set a Permissions-Policy header to control which browser features the page can use.';
    }
    return {
      score: score,
      offending: offending,
      advice: advice
    };
  }
};
