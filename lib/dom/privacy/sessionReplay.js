(function (util) {
  'use strict';

  // Session-replay tools record what the user does on the page — mouse
  // movements, scrolls, clicks, sometimes form input. Unlike the ad-tech
  // pixels handled by surveillance.js, these are typically deployed
  // intentionally for UX research, debugging or conversion analysis, and
  // they can be configured to redact sensitive fields. The privacy
  // concern is real but the remediation is different:
  //
  //   * configure input redaction so passwords, credit cards and PII are
  //     masked before transmission;
  //   * confirm the user has consented (GDPR Art. 6/7, CCPA, similar)
  //     before recording starts;
  //   * verify where the recordings are stored and for how long.
  //
  // The advice text reflects that — we are not telling sites to stop
  // using these tools, only that they should be configured carefully.
  //
  // Suffix matching, never substring (so myhotjar.com / clarity-clone.ms
  // don't false-match).
  const sessionReplayDomains = [
    // Hotjar
    'hotjar.com',
    // FullStory
    'fullstory.com',
    // Microsoft Clarity
    'clarity.ms',
    // Smartlook
    'smartlook.com',
    'smartlook.cloud',
    // LogRocket (multiple sharded CDNs)
    'logrocket.com',
    'logrocket.io',
    'lr-ingest.io',
    'lr-in.com',
    'lrkt-in.com',
    // Mouseflow
    'mouseflow.com',
    // Quantum Metric
    'quantummetric.com',
    // Inspectlet
    'inspectlet.com',
    // Lucky Orange
    'luckyorange.com',
    'luckyorange.net',
    // Crazy Egg
    'crazyegg.com'
  ];

  function isSessionReplayHost(url) {
    if (!url) {
      return false;
    }
    const host = util.getHostname(url).toLowerCase();
    if (!host) {
      return false;
    }
    for (const d of sessionReplayDomains) {
      if (host === d || host.endsWith('.' + d)) {
        return true;
      }
    }
    return false;
  }

  const offending = [];

  const scripts = document.querySelectorAll('script');
  for (let i = 0, len = scripts.length; i < len; i++) {
    if (scripts[i].src && isSessionReplayHost(scripts[i].src)) {
      offending.push(util.getAbsoluteURL(scripts[i].src));
    }
  }

  const iframes = document.querySelectorAll('iframe');
  for (let i = 0, len = iframes.length; i < len; i++) {
    if (iframes[i].src && isSessionReplayHost(iframes[i].src)) {
      offending.push(util.getAbsoluteURL(iframes[i].src));
    }
  }

  const score = offending.length > 0 ? 0 : 100;

  return {
    id: 'sessionReplay',
    title: 'Configure session-replay tools carefully if you use them',
    description:
      'Session-replay tools (Hotjar, FullStory, Microsoft Clarity, LogRocket, Smartlook, Mouseflow and similar) record user behaviour on the page in detail. They have legitimate uses but they have also been shown to capture personally-identifiable information from form fields when not configured with redaction. If you use one of these, make sure input redaction is on, that you have explicit user consent under the relevant regulation (GDPR, CCPA, etc.) before recording starts, and that you know where the recordings are stored and for how long. https://www.princeton.edu/~jmayer/papers/Acar2018.pdf',
    advice:
      score === 0
        ? 'The page loads ' +
          util.plural(offending.length, 'session-replay script') +
          '. Confirm input redaction is enabled, that you have explicit user consent before recording starts, and that the data-retention and storage location of the recordings match your privacy policy.'
        : '',
    score: score,
    weight: 5,
    severity: 'warn',
    offending: offending,
    tags: ['privacy']
  };
})(util);
