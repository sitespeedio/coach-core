export default {
  id: 'crossOriginEmbedderPolicyHeader',
  title:
    'Set a Cross-Origin-Embedder-Policy header so cross-origin subresources opt in to being embedded.',
  description:
    'Cross-Origin-Embedder-Policy (COEP) makes the page refuse to load cross-origin subresources unless they explicitly opt in via CORP or CORS. Together with Cross-Origin-Opener-Policy it puts the page in a cross-origin isolated context, which mitigates cross-window side-channel attacks (Spectre) and unlocks high-resolution timers and SharedArrayBuffer. https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy',
  weight: 4,
  tags: ['headers', 'privacy'],
  processPage: function (page) {
    const offending = [];
    let score = 0;
    let advice = '';
    const finalUrl = page.finalUrl;
    page.assets.forEach(function (asset) {
      if (asset.url === finalUrl) {
        const headers = asset.headers.response;
        if (headers['cross-origin-embedder-policy']) {
          score = 100;
        } else {
          offending.push(asset.url);
        }
      }
    });
    if (score === 0) {
      advice =
        'Set a Cross-Origin-Embedder-Policy header (typically require-corp or credentialless) on the document response to control cross-origin embedding.';
    }
    return {
      score: score,
      offending: offending,
      advice: advice
    };
  }
};
