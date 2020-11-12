(function () {
  'use strict';

  function domDepth(document) {
    const allElems = document.getElementsByTagName('*');
    let allElemsLen = allElems.length;
    let totalParents = 0;
    let maxParents = 0;

    while (allElemsLen--) {
      let parents = numParents(allElems[allElemsLen]);
      if (parents > maxParents) {
        maxParents = parents;
      }
      totalParents += parents;
    }

    const average = totalParents / allElems.length;

    return {
      avg: average,
      max: maxParents
    };
  }

  function numParents(elem) {
    let n = 0;

    if (elem.parentNode) {
      while ((elem = elem.parentNode)) {
        n++;
      }
    }
    return n;
  }

  const depth = domDepth(document);

  return {
    avg: Math.round(depth.avg),
    max: depth.max
  };
})();
