export default {
  id: 'strictTransportSecurityHeader',
  title:
    'Set a strict transport header to make sure the user always use HTTPS.',
  description:
    'The HTTP Strict-Transport-Security response header (often abbreviated as HSTS) lets a web site tell browsers that it should only be accessed using HTTPS, instead of using HTTP. https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security.',
  weight: 6,
  severity: 'error',
  tags: ['headers', 'privacy'],
  processPage: function (page) {
    const offending = [];
    let score = 100;
    let advice = '';
    const finalUrl = page.finalUrl;
    if (finalUrl.includes('https://')) {
      for (const asset of page.assets) {
        if (asset.url === finalUrl) {
          const headers = asset.headers.response;
          if (headers['strict-transport-security']) {
            const h = headers['strict-transport-security'][0];
            if (!h.includes('includeSubDomains')) {
              score = 90;
              advice =
                'A strict transport header is set but miss out on setting includeSubDomains';
            }
            if (h.includes('max-age=')) {
              const parts = h.split(';');
              if (parts[0].startsWith('max-age=')) {
                const time = Number(parts[0].slice(parts[0].indexOf('=') + 1));
                // The HSTS preload list (https://hstspreload.org)
                // requires max-age >= 31536000 (one year). Anything below
                // that is below the practical security baseline.
                const minOneYear = 31_536_000;
                if (time < minOneYear) {
                  score -= 20;
                  advice +=
                    'The max-age is lower than one year, which is below the HSTS preload list minimum. Set it to at least 31536000 (one year), and 63072000 (two years) is recommended.';
                }
              }
            } else {
              score = 0;
              advice =
                'A strict transport header is set but but no max-age! The header is not set correct.';
            }
          } else {
            score = 0;
            offending.push(asset.url);
            advice =
              'Set a strict transport header to make sure the user always use HTTPS.';
          }
        }
      }
    }
    return {
      score: score,
      offending: offending,
      advice: advice
    };
  }
};
