'use strict';

module.exports = {
  id: 'avoidRenderBlocking',
  title: 'Avoid slowing down the critical rendering path',
  description:
    'The critical rendering path is what the browser needs to do to start rendering the page. Every file requested inside of the head element will postpone the rendering of the page, because the browser need to do the request. Avoid loading JavaScript synchronously inside of the head (you should not need JavaScript to render the page), request files from the same domain as the main document (to avoid DNS lookups) and inline CSS for really fast rendering and a short rendering path.',
  weight: 10,
  tags: ['performance'],
  processPage: function (page, domAdvice, options) {
    let score = 100;
    let advice = '';
    let blockingJS = 0;
    let blockingCSS = 0;
    const blockingResources = [];
    const potentiallyBlockingResources = [];

    if (
      (options.browser && options.browser === 'chrome') ||
      options.browser === 'edge'
    ) {
      if (page.renderBlocking && Object.keys(page.renderBlocking).length > 0) {
        // we use Chrome(ium) and have render blocking info
        advice = '';
        for (let asset of page.assets) {
          if (
            (asset.renderBlocking && asset.renderBlocking === 'blocking') ||
            asset.renderBlocking === 'in_body_parser_blocking'
          ) {
            if (asset.type === 'javascript') {
              blockingJS++;
              blockingResources.push(asset.url);
            } else if (asset.type === 'css') {
              blockingCSS++;
            }
          } else if (
            asset.renderBlocking &&
            asset.renderBlocking === 'potentially_blocking'
          ) {
            potentiallyBlockingResources.push(asset.url);
          }
        }
        advice =
          `The page has ${page.renderBlocking.blocking} blocking requests and ${page.renderBlocking.in_body_parser_blocking} in body parser blocking (${blockingJS} JavaScript and ${blockingCSS} CSS).` +
          (page.renderBlocking.potentiallyBlocking > 0
            ? ` There are ${
                page.renderBlocking.potentiallyBlocking
              } potentially render blocking requests. You need to verify if ${
                page.renderBlocking.potentiallyBlocking > 1
                  ? 'they are'
                  : 'it is'
              } render blocking: ${potentiallyBlockingResources.join(' ')}`
            : '');

        score = Math.max(
          0,
          100 - (blockingJS * 10 + page.renderBlocking.potentiallyBlocking)
        );
      }
      if (advice === '' && blockingCSS === 0) {
        advice = 'There are no render blocking resources.';
      } else if (advice === '' && blockingCSS === 1) {
        advice =
          'There are one render blocking CSS. Potentially you could inline the CSS to make the page render faster for first view but could potentially make your users journey slower.';
      } else if (advice === '' && blockingCSS > 1) {
        advice = `There are ${blockingCSS} CSS blocking resources, maybe you could combine them?`;
      }
      return {
        score: score,
        offending: blockingResources,
        advice: advice
      };
    } else {
      return {};
    }
  }
};
