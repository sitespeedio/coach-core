(function () {
  'use strict';

  // Detect a referrer policy declared in the document itself via
  // <meta name="referrer" content="..."> Note: a Referrer-Policy response
  // header is preferred and is checked separately by the HAR rule. This DOM
  // rule is the fallback signal for runs without a HAR.
  let metaContent = '';
  const metas = document.getElementsByTagName('meta');
  for (let i = 0, len = metas.length; i < len; i++) {
    const name = metas[i].getAttribute('name');
    if (name && name.toLowerCase() === 'referrer') {
      metaContent = (metas[i].getAttribute('content') || '').trim();
      break;
    }
  }

  // The default (no-referrer-when-downgrade in older specs, strict-origin-when-cross-origin
  // since 2020) leaks the full URL on same-origin navigations. Anything explicit
  // is better; flag a missing or empty meta.
  const hasMeta = metaContent.length > 0;
  const score = hasMeta ? 100 : 0;

  return {
    id: 'referrerPolicy',
    title: 'Declare a referrer policy on the document',
    description:
      'Without an explicit referrer policy the browser falls back to the user-agent default and may leak the full URL of the previous page (including query strings) to every cross-origin request. Set a Referrer-Policy response header (preferred) or a <meta name="referrer"> tag in the document. https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy',
    advice:
      score === 0
        ? 'No <meta name="referrer"> tag was found on the page. Set a Referrer-Policy response header (preferred) or add a meta tag, for example <meta name="referrer" content="strict-origin-when-cross-origin">.'
        : '',
    score: score,
    weight: 3,
    severity: 'warn',
    offending: [],
    tags: ['privacy']
  };
})();
