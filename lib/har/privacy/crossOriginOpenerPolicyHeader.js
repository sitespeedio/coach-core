export default {
  id: 'crossOriginOpenerPolicyHeader',
  title:
    'Set a Cross-Origin-Opener-Policy header to isolate the page from cross-origin windows.',
  description:
    'Cross-Origin-Opener-Policy (COOP) lets a page sever its window-group ties to cross-origin documents that opened it or that it opens. Together with Cross-Origin-Embedder-Policy it puts the page in a cross-origin isolated context, which mitigates cross-window side-channel attacks (Spectre) and unlocks high-resolution timers and SharedArrayBuffer. https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy',
  weight: 4,
  severity: 'warn',
  tags: ['headers', 'privacy'],
  processPage: function (page) {
    const offending = [];
    let score = 0;
    let advice = '';
    const finalUrl = page.finalUrl;
    for (const asset of page.assets) {
      if (asset.url === finalUrl) {
        const headers = asset.headers.response;
        if (headers['cross-origin-opener-policy']) {
          score = 100;
        } else {
          offending.push(asset.url);
        }
      }
    }
    if (score === 0) {
      advice =
        'Set a Cross-Origin-Opener-Policy header (typically same-origin) on the document response to isolate the page from cross-origin windows.';
    }
    return {
      score: score,
      offending: offending,
      advice: advice
    };
  }
};
