(function (util) {
  'use strict';

  // Same-origin iframes are part of the page's own trust boundary, so missing
  // sandbox on those is not a finding here. We only flag cross-origin iframes
  // that load over http(s) without a sandbox attribute, since those are the
  // ones that benefit from the extra isolation.
  const pageHost = util.getHostname(document.URL).toLowerCase();
  const offending = [];

  const iframes = document.getElementsByTagName('iframe');
  for (let i = 0, len = iframes.length; i < len; i++) {
    const iframe = iframes[i];
    if (!iframe.src) {
      continue;
    }
    if (!/^https?:/i.test(iframe.src)) {
      continue;
    }
    const host = util.getHostname(iframe.src).toLowerCase();
    if (!host || host === pageHost) {
      continue;
    }
    if (!iframe.hasAttribute('sandbox')) {
      offending.push(util.getAbsoluteURL(iframe.src));
    }
  }

  const score = offending.length > 0 ? 0 : 100;

  return {
    id: 'iframeSandbox',
    title: 'Sandbox cross-origin iframes',
    description:
      'Adding a sandbox attribute to a cross-origin iframe restricts what the embedded page can do (script execution, form submission, top-level navigation, popups, etc.) and is one of the cheapest ways to limit the blast radius of a third-party embed. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#sandbox',
    advice:
      score === 0
        ? 'The page embeds ' +
          util.plural(offending.length, 'cross-origin iframe') +
          ' without a sandbox attribute. Add sandbox="" with the minimum set of allow-* tokens the embed actually needs.'
        : '',
    score: score,
    weight: 4,
    offending: offending,
    tags: ['privacy']
  };
})(util);
