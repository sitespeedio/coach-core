(function () {
  'use strict';
  const { userAgent } = navigator;
  if (userAgent.includes('Firefox/')) {
    return `Firefox ${userAgent.split('Firefox/')[1]}`;
  } else if (userAgent.includes('Edg/')) {
    return `Edge ${userAgent.split('Edg/')[1]}`;
  } else if (userAgent.includes('Chrome/')) {
    return `Chrome ${userAgent.match(/(Chrome)\/(\S+)/)[2]}`;
  } else if (userAgent.includes('Safari/')) {
    return `Safari ${userAgent.match(/(Version)\/(\S+)/)[2]}`;
  } else return 'Unknown';
})();
