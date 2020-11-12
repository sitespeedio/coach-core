(function () {
  'use strict';

  // we now do the same check as WebPageTest
  let isResponsive = true;
  const bodyScrollWidth = document.body.scrollWidth;
  const windowInnerWidth = window.innerWidth;
  const nodes = document.body.children;

  if (bodyScrollWidth > windowInnerWidth) {
    isResponsive = false;
  }

  for (var i in nodes) {
    if (nodes[i].scrollWidth > windowInnerWidth) {
      isResponsive = false;
    }
  }

  return isResponsive;
})();
