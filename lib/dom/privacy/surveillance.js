(function (util) {
  'use strict';

  // Hostnames whose business model is surveillance capitalism. We match by
  // exact host or by suffix (e.g. www.google-analytics.com), never by raw
  // substring, so that mygoogle.com / facebook-clone.com don't false-match.
  const surveillanceDomains = [
    'google-analytics.com',
    'googletagmanager.com',
    'doubleclick.net',
    'googlesyndication.com',
    'googleadservices.com',
    'googletagservices.com',
    'facebook.com',
    'facebook.net',
    'fbcdn.net',
    'youtube.com'
  ];

  function isSurveillanceHost(url) {
    if (!url) {
      return false;
    }
    const host = util.getHostname(url).toLowerCase();
    if (!host) {
      return false;
    }
    for (let i = 0; i < surveillanceDomains.length; i++) {
      const d = surveillanceDomains[i];
      if (host === d || host.endsWith('.' + d)) {
        return true;
      }
    }
    return false;
  }

  const offending = [];

  const scripts = document.getElementsByTagName('script');
  for (let i = 0, len = scripts.length; i < len; i++) {
    if (scripts[i].src && isSurveillanceHost(scripts[i].src)) {
      offending.push(util.getAbsoluteURL(scripts[i].src));
    }
  }

  const iframes = document.getElementsByTagName('iframe');
  for (let i = 0, len = iframes.length; i < len; i++) {
    if (iframes[i].src && isSurveillanceHost(iframes[i].src)) {
      offending.push(util.getAbsoluteURL(iframes[i].src));
    }
  }

  const score = offending.length > 0 ? 0 : 100;

  return {
    id: 'surveillance',
    title: 'Avoid embedding services from surveillance capitalist companies',
    description:
      'Embedding scripts or iframes from companies whose business model is surveillance capitalism (Google, Facebook, etc.) leaks detailed user data on every page view, often before the user has had a chance to consent. See https://en.wikipedia.org/wiki/Surveillance_capitalism for background. Prefer privacy-respecting alternatives where possible.',
    advice:
      score === 0
        ? 'The page embeds ' +
          util.plural(offending.length, 'resource') +
          ' from companies that profit from user surveillance. Consider privacy-respecting alternatives.'
        : '',
    score: score,
    weight: 10,
    offending: offending,
    tags: ['privacy']
  };
})(util);
