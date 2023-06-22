(function () {
  'use strict';

  function storageSize(storage) {
    // if local storage is disabled
    if (storage) {
      const keys = storage.length || Object.keys(storage).length;
      let bytes = 0;

      for (let i = 0; i < keys; i++) {
        const key = storage.key(i);
        const val = storage.getItem(key);
        bytes += key.length + val.length;
      }
      return bytes;
    } else {
      return 0;
    }
  }
  try {
    return storageSize(window.localStorage);
  } catch (error) {
    return 'Could not access localStorage.';
  }
})();
