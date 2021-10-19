(function (util) {
  'use strict';

  const versions = [];
  // check that we got a jQuery
  if (typeof window.jQuery === 'function') {
    // https://github.com/sitespeedio/coach-core/issues/21#issuecomment-717041439
    let keepRef = window.$;
    versions.push(window.jQuery.fn.jquery);
    let old = window.jQuery;
    while (old.fn && old.fn.jquery) {
      old = window.jQuery.noConflict(true);
      if (!window.jQuery || !window.jQuery.fn || !window.jQuery.fn.jquery) {
        break;
      }
      if (old.fn.jquery === window.jQuery.fn.jquery) {
        break;
      }
      versions.push(window.jQuery.fn.jquery);
    }
    window.jQuery = window.$ = keepRef;
  }

  // TODO also add check for jQuery version. If we have a really old version (1 year old?) then show it!

  return {
    id: 'jquery',
    title: 'Avoid using more than one jQuery version per page',
    description:
      "There are sites out there that use multiple versions of jQuery on the same page. You shouldn't do that because the user will then unnecessarily download extra data. Cleanup the code and make sure you only use one version.",
    advice:
      versions.length > 1
        ? 'The page uses ' +
          util.plural(versions.length, 'version') +
          ' of jQuery! You only need one version, please remove the unnecessary version(s).'
        : '',
    score: versions.length > 1 ? 0 : 100,
    weight: 4,
    offending: versions,
    tags: ['jQuery', 'performance']
  };
})(util);
