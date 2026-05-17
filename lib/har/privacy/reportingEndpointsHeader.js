export default {
  id: 'reportingEndpointsHeader',
  title:
    'Declare reporting endpoints so the browser can deliver Reporting-API events.',
  description:
    'The Reporting-Endpoints response header (the successor to Report-To) names the URLs that browsers should POST reports to. Without it, CSP report-to directives, Cross-Origin-Opener-Policy reports, NEL data and other Reporting-API events have nowhere to go. The legacy Report-To header is still accepted for older Chromium versions. https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Reporting-Endpoints',
  weight: 0,
  severity: 'info',
  tags: ['headers', 'privacy', 'observability'],
  processPage: function (page) {
    const offending = [];
    let score = 0;
    let advice = '';
    const finalUrl = page.finalUrl;
    for (const asset of page.assets) {
      if (asset.url === finalUrl) {
        const headers = asset.headers.response;
        // Reporting-Endpoints is the modern shape; Report-To is the
        // deprecated predecessor still used by older Chromium clients.
        if (headers['reporting-endpoints'] || headers['report-to']) {
          score = 100;
        } else {
          offending.push(asset.url);
        }
      }
    }
    if (score === 0) {
      advice =
        'Set a Reporting-Endpoints header (or the legacy Report-To header) so CSP reports, NEL data and other Reporting-API events have an endpoint to land at.';
    }
    return {
      score: score,
      offending: offending,
      advice: advice
    };
  }
};
