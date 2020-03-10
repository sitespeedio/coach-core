# The Coach - core

[![Build status][travis-image]][travis-url]

[Documentation](https://www.sitespeed.io/documentation/coach/) | [Changelog](https://github.com/sitespeedio/coach-core/blob/master/CHANGELOG.md)

![The coach](img/coach.png)

The coach helps you find performance, best practice and privacy problems on your web page. *coach-core* holds the JavaScript functionality to analyse your page, the [Coach project](https://github.com/sitespeedio/coach) is the CLI.

```js
const coach = require('coach-core');
  
// Get the JavaScript code that will analyse a page
const domAdviceJavaScript = await coach.getDomAdvice();
// Take the *domAdviceJavaScript* and run it in your browser and take care of the result.
const domResult = ...

const har = // we get the HAR from a browser

// If your HARhar contains multiple pages (multiple runs etc) you can use the API
// to get the page that you want
const firstPageHar = coach.pickAPage(har, 0);

const harResult = await coach.analyseHar(firstPageHar);

// Say that you got the result from the browser in domAdviceResult
// and the HAR result in harAdviceResult
const coachResult = coach.merge(domResult, harResult);
```

[travis-image]: https://img.shields.io/travis/sitespeedio/coach-core/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/sitespeedio/coach-core