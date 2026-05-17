(function () {
  'use strict';

  let mark = 0;
  let measure = 0;
  if (globalThis.performance && globalThis.performance.getEntriesByType) {
    measure = globalThis.performance.getEntriesByType('measure').length;
    mark = globalThis.performance.getEntriesByType('mark').length;
  }
  return {
    marks: mark,
    measures: measure
  };
})();
