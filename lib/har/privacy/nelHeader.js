export default {
  id: 'nelHeader',
  title: 'Set a NEL header so the browser reports network errors back to you.',
  description:
    'The NEL (Network Error Logging) response header tells the browser to record connection-level failures (DNS, TLS, HTTP errors) and ship them to a reporting endpoint. NEL pairs with the Reporting-Endpoints / Report-To header — the page declares the endpoint group and NEL points at it. Together they give you visibility into errors that never reach your origin server. https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/NEL',
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
        if (headers['nel']) {
          score = 100;
        } else {
          offending.push(asset.url);
        }
      }
    }
    if (score === 0) {
      advice =
        'Set a NEL header (paired with Reporting-Endpoints) to collect connection-level error reports from the field.';
    }
    return {
      score: score,
      offending: offending,
      advice: advice
    };
  }
};
