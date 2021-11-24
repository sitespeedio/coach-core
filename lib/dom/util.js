'use strict';

const util = {
  /**
   * Make your URL absolute.
   * @memberof util
   * @param {String} url The URL to convert to absolute.
   * @returns {String} the absolute URL including host/protocol.
   */
  getAbsoluteURL: function (url) {
    const a = window.document.createElement('a');
    a.href = url;
    return a.href;
  },

  /**
   * Get the hostname from a URL
   * @memberof util
   * @param {String} url The URL.
   * @returns {String} the hostname from the URL.
   */
  getHostname: function (url) {
    const a = window.document.createElement('a');
    a.href = url;
    return a.hostname;
  },

  /**
   * Checks if an element exist in an array.
   *
   * @memberof util
   * @param {String} element the element.
   * @param {Array} array the array.
   * @returns {Boolean} true if the element exist.
   */
  exists: function (element, array) {
    return array.some(function (e) {
      return e === element;
    });
  },

  /**
   * Returns an array filter function for finding tags with an attribute specified value, matching case insensitive.
   * @param attributeName the name of the attribute to look for (html attribute values are always case insensitive).
   * @param attributeValue the value to match against, ignoring case.
   * @returns {Function} function that can be passed to Array#filter
   */
  caseInsensitiveAttributeValueFilter: function (
    attributeName,
    attributeValue
  ) {
    return function (item) {
      const attribute = item.getAttribute(attributeName) || '';
      if (attribute.toLowerCase() === attributeValue.toLowerCase()) {
        return item;
      }
      return undefined;
    };
  },

  /**
   * Is the connection used for the main document using HTTP/2?
   * Works in Chrome, Firefox, Edge and other browsers that supports Resource Timing
   * API v2 (not Safari yet).
   * @memberof util
   * @returns {Boolean} true if the connection is HTTP/2
   */
  isHTTP2: function () {
    const type = util.getConnectionType().toLowerCase();
    return type === 'h2' || type.startsWith('spdy');
  },

  /**
   * Is the connection used for the main document using HTTP/3?
   * @memberof util
   * @returns {Boolean} true if the connection is HTTP/3
   */
  isHTTP3: function () {
    const type = util.getConnectionType().toLowerCase();
    return type.startsWith('h3');
  },

  /**
   * Get the connection type used for the main document. Works in Chrome, Firefox,
   * Edge and  + browsers that support Resource Timing
   * API v2.
   * @memberof util
   * @returns {String} http/1 or h2 for http 1 and 2 respectively. 'unknown' if browser lacks api to determine it.
   */
  getConnectionType: function () {
    // it's easy in Chrome
    if (
      window.performance.getEntriesByType('navigation') &&
      window.performance.getEntriesByType('navigation')[0] &&
      window.performance.getEntriesByType('navigation')[0].nextHopProtocol
    ) {
      return window.performance.getEntriesByType('navigation')[0]
        .nextHopProtocol;
    } else if (
      window.performance &&
      window.performance.getEntriesByType &&
      window.performance.getEntriesByType('resource')
    ) {
      // if you support resource timing v2
      // it's kind of easy too
      const resources = window.performance.getEntriesByType('resource');
      // now we "only" need to know if it is v2
      if (resources.length > 1 && resources[0].nextHopProtocol) {
        // if it's the same domain, say it's OK
        const host = document.domain;

        for (let i = 0, len = resources.length; i < len; i++) {
          if (host === util.getHostname(resources[i].name)) {
            return resources[i].nextHopProtocol;
          }
        }
      }
    }
    return 'unknown';
  },

  /**
   * Get JavaScript requests that are loaded synchronously. All URLs are absolute.
   * @memberof util
   * @param {Object} parentElement the parent element that has all the scripts.
   * @returns {Array} an array with the URL to each JavaScript file that is loaded synchronously.
   */
  getSynchJSFiles: function (parentElement) {
    const scripts = Array.prototype.slice.call(
      parentElement.getElementsByTagName('script')
    );

    return scripts
      .filter(function (s) {
        return !s.async && s.src && !s.defer;
      })
      .map(function (s) {
        return util.getAbsoluteURL(s.src);
      });
  },

  /**
   * Get JavaScript requests that are loaded asynchronously. All URLs are absolute.
   * @memberof util
   * @param {Object} parentElement the parent element that has all the scripts.
   * @returns {Array} an array with the URL to each JavaScript file that are loaded asynchronously.
   */
  getAsynchJSFiles: function (parentElement) {
    const scripts = Array.prototype.slice.call(
      parentElement.getElementsByTagName('script')
    );

    return scripts
      .filter(function (s) {
        return s.async && s.src;
      })
      .map(function (s) {
        return util.getAbsoluteURL(s.src);
      });
  },

  /**
   * Get Resource Hints hrefs by type
   * @memberof util
   * @param {String} type the name of the Resources hint: dns-prefetch, preconnect, prefetch, prerender
   * @returns {Array} an array of matching hrefs
   */
  getResourceHintsHrefs: function (type) {
    const links = Array.prototype.slice.call(
      window.document.head.getElementsByTagName('link')
    );

    return links
      .filter(function (link) {
        return link.rel === type;
      })
      .map(function (link) {
        return link.href;
      });
  },

  /**
   * Get CSS requests. All URLs are absolute.
   * @memberof util
   * @param {Object} parentElement the parent element that has all the scripts.
   * @returns {Array} an array with the URL to each CSS file that is loaded synchronously.
   */
  getCSSFiles: function (parentElement) {
    const links = Array.prototype.slice.call(
      parentElement.getElementsByTagName('link')
    );

    return links
      .filter(function (link) {
        // make sure we skip data:
        return link.rel === 'stylesheet' && !link.href.startsWith('data:');
      })
      .map(function (link) {
        return util.getAbsoluteURL(link.href);
      });
  },

  plural: function (number, text) {
    if (number > 1) {
      text += 's';
    }
    return `${number} ${text}`;
  },

  /**
   * Get the size of an asset. Will try to use the Resource Timing V2. If that's
   * not available or the asset size is unknown we report 0.
   **/
  getTransferSize: function (url) {
    const entries = window.performance.getEntriesByName(url, 'resource');
    if (entries.length === 1 && typeof entries[0].transferSize === 'number') {
      return entries[0].transferSize;
    } else {
      return 0;
    }
  },
  ms(ms) {
    if (ms < 1000) {
      return ms + ' ms';
    } else {
      return Number(ms / 1000).toFixed(3) + ' s';
    }
  }
};
