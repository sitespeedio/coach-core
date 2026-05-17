(function () {
  'use strict';

  return globalThis.navigator.connection
    ? globalThis.navigator.connection.effectiveType
    : 'unknown';
})();
