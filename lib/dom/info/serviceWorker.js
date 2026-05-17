(function () {
  'use strict';

  if ('serviceWorker' in navigator) {
    // Only report activated service workers
    if (navigator.serviceWorker.controller) {
      return navigator.serviceWorker.controller.state === 'activated'
        ? navigator.serviceWorker.controller.scriptURL
        : false;
    } else {
      return false;
    }
  } else {
    return false;
  }
})();
