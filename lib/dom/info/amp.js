(function () {
  'use strict';

  const html = document.querySelectorAll('html')[0];

  return (html && html.getAttribute('amp-version')) || globalThis.AMP
    ? html.getAttribute('amp-version') || true
    : false;
})();
