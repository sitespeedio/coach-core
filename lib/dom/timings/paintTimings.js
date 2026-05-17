(function () {
  'use strict';
  const entries = globalThis.performance.getEntriesByType('paint');
  const cleaned = {};
  if (entries.length > 0) {
    for (const entry of entries) {
      cleaned[entry.name] = Number(entry.startTime.toFixed(0));
    }
    return cleaned;
  } else return;
})();
