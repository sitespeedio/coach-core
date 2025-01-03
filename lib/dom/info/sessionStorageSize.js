(function () {
  'use strict';

  function storageSize(storage) {
    const keys = storage.length || Object.keys(storage).length;
    let bytes = 0;

    for (let i = 0; i < keys; i++) {
      const key = storage.key(i);
      const val = storage.getItem(key);
      bytes += key.length + val.length;
    }
    return bytes;
  }

  try {
    return storageSize(window.sessionStorage);
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return 'Could not access sessionStorage';
  }
})();
