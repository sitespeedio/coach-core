(function (util) {
  'use strict';

  const offending = [];
  const links = document.getElementsByTagName('link');

  for (let i = 0, len = links.length; i < len; i++) {
    if (links[i].media === 'print') {
      offending.push(util.getAbsoluteURL(links[i].href));
    }
  }

  const score = offending.length * 10;

  return {
    id: 'cssPrint',
    title: 'Do not load specific print stylesheets.',
    description:
      'Loading a specific stylesheet for printing slows down the page, even though it is not used. You can include the print styles inside your other CSS file(s) just by using an @media query targeting type print.',
    advice:
      offending.length > 0
        ? `The page has ${util.plural(
            offending.length,
            'print stylesheet'
          )}. You should include that stylesheet using @media type print instead.`
        : '',
    score: Math.max(0, 100 - score),
    weight: 1,
    offending: offending,
    tags: ['performance', 'css']
  };
})(util);
