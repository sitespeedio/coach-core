(function (util) {
  'use strict';

  const offending = [];
  const styles = util.getCSSFiles(document.head);
  const scripts = util.getSynchJSFiles(document.head);
  const docDomain = document.domain;
  const domains = [];
  // TODO does preconnect really matter when you are inside of head?
  const preconnects = util.getResourceHintsHrefs('preconnect');
  const preconnectDomains = preconnects.map(function (preconnect) {
    return util.getHostname(preconnect);
  });
  let blockingCSS = 0;
  let blockingJS = 0;
  let message = '';
  let score = 0;

  function testByType(assetUrl) {
    const domain = util.getHostname(assetUrl);
    // if it is from different domain or not
    if (domain !== docDomain) {
      offending.push(assetUrl);
      // is this the first time this domain is used?
      if (!util.exists(domain, domains)) {
        // hurt depending on if it's preconnected or not
        score += util.exists(domain, preconnectDomains) ? 5 : 10;
        domains.push(domain);
      }
      score += 5;
    } else {
      offending.push(assetUrl);
      score += 5;
    }
  }

  // TODO do we have a way to check if we different domains act as one for H2?
  // know we don't even check it
  if (util.isHTTP2()) {
    if (styles.length > 0) {
      message = '';
      // check the size
      styles.forEach(function (url) {
        if (util.getTransferSize(url) > 14500) {
          offending.push(url);
          score += 5;
          blockingCSS++;
          message +=
            'The style ' +
            url +
            ' is larger than the magic number TCP window size 14.5 kB. Make the file smaller and the page will render faster. ';
        }
      });
    }
    if (scripts.length > 0) {
      score += scripts.length * 10;
      scripts.forEach(function (url) {
        offending.push(url);
        blockingJS++;
      });
      message +=
        "Avoid loading synchronously JavaScript inside of head, you shouldn't need JavaScript to render your page! ";
    }
  } else if (util.isHTTP3()) {
    // Recommendations for HTTP3 to come
  } else {
    // we are using HTTP/1
    styles.forEach(function (style) {
      testByType(style);
    });
    blockingCSS = styles.length;
    scripts.forEach(function (script) {
      testByType(script);
    });
    blockingJS = scripts.length;
  }

  if (offending.length > 0) {
    message += `The page has ${util.plural(
      blockingCSS,
      'render blocking CSS request'
    )} and ${util.plural(
      blockingJS,
      'blocking JavaScript request'
    )} inside of head.`;
  }

  return {
    id: 'avoidRenderBlocking',
    title: 'Avoid slowing down the critical rendering path',
    description:
      'The critical rendering path is what the browser needs to do to start rendering the page. Every file requested inside of the head element will postpone the rendering of the page, because the browser need to do the request. Avoid loading JavaScript synchronously inside of the head (you should not need JavaScript to render the page), request files from the same domain as the main document (to avoid DNS lookups) and inline CSS for really fast rendering and a short rendering path.',
    advice: message,
    score: Math.max(0, 100 - score),
    weight: 10,
    offending: offending,
    tags: ['performance']
  };
})(util);
