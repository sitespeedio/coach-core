(function (util) {
  'use strict';

  const offending = [];
  const offendingDomains = [];
  // simplify and only look for css & js spof
  const docDomain = document.domain;
  // do we have any CSS loaded inside of head from a different domain?
  const styles = util.getCSSFiles(document.head);
  let score = 0;

  styles.forEach(function (style) {
    const styleDomain = util.getHostname(style);
    if (styleDomain !== docDomain) {
      offending.push(style);
      if (offendingDomains.indexOf(styleDomain) === -1) {
        offendingDomains.push(styleDomain);
        score += 10;
      }
    }
  });

  // do we have any JS loaded inside of head from a different domain?
  const scripts = util.getSynchJSFiles(document.head);

  scripts.forEach(function (script) {
    const scriptDomain = util.getHostname(script);
    if (scriptDomain !== docDomain) {
      offending.push(script);
      if (offendingDomains.indexOf(scriptDomain) === -1) {
        offendingDomains.push(scriptDomain);
        score += 10;
      }
    }
  });

  return {
    id: 'spof',
    title: 'Avoid Frontend single point of failures',
    description:
      "A page can be stopped from loading in the browser if a single JavaScript, CSS, and in some cases a font, couldn't be fetched or is loading really slowly (the white screen of death). That is a scenario you really want to avoid. Never load 3rd-party components synchronously inside of the head tag.",
    advice:
      offending.length > 0
        ? 'The page has ' +
          util.plural(offending.length, 'request') +
          ' inside of the head that can cause a SPOF (single point of failure). Load them asynchronously or move them outside of the document head.'
        : '',
    score: Math.max(0, 100 - score),
    weight: 7,
    offending: offending,
    tags: ['performance', 'css', 'js']
  };
})(util);
