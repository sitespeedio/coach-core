(function () {
  'use strict';
  const entries = window.performance.getEntriesByType('paint');
  const cleaned = {};
  if (entries.length > 0) {
    for (var i = 0; i < entries.length; i++) {
      cleaned[entries[i].name] = Number(entries[i].startTime.toFixed(0));
    }
    return cleaned;
  } else return;
})();
