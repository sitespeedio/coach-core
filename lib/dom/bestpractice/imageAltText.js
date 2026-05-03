(function (util) {
  'use strict';

  // An <img> needs a textual alternative for assistive tech. The accepted
  // shapes are: alt="meaningful text" for content images, or alt="" (decorative)
  // / role="presentation" / aria-hidden="true" for purely decorative images.
  // A missing alt attribute entirely is the failure case.
  const offending = [];
  const images = document.getElementsByTagName('img');
  for (let i = 0, len = images.length; i < len; i++) {
    const img = images[i];
    const hasAlt = img.hasAttribute('alt');
    const ariaHidden = img.getAttribute('aria-hidden');
    const role = img.getAttribute('role');
    const isMarkedDecorative =
      (ariaHidden && ariaHidden.toLowerCase() === 'true') ||
      (role && role.toLowerCase() === 'presentation') ||
      (role && role.toLowerCase() === 'none');
    if (!hasAlt && !isMarkedDecorative) {
      offending.push(util.getAbsoluteURL(img.currentSrc || img.src || ''));
    }
  }

  const score =
    offending.length === 0 ? 100 : Math.max(0, 100 - offending.length * 10);

  return {
    id: 'imageAltText',
    title: 'Give every image a textual alternative',
    description:
      'Every <img> needs an alt attribute. Use alt="meaningful description" for content images so assistive technologies can announce them, or alt="" (or role="presentation" / aria-hidden="true") for purely decorative images so they are skipped. A missing alt attribute leaves screen reader users with no information at all. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#alt',
    advice:
      offending.length > 0
        ? 'The page has ' +
          util.plural(offending.length, 'image') +
          ' without an alt attribute. Add alt="..." with a description, or alt="" if the image is purely decorative.'
        : '',
    score: score,
    weight: 4,
    offending: offending,
    tags: ['bestpractice', 'accessibility']
  };
})(util);
