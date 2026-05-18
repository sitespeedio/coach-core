# The Coach - core

![Unit tests](https://github.com/sitespeedio/coach-core/workflows/Unit%20tests/badge.svg?branch=main)

[Documentation](https://www.sitespeed.io/documentation/coach/) | [Changelog](https://github.com/sitespeedio/coach-core/blob/main/CHANGELOG.md)

![The coach](img/coach.png)

The coach helps you find performance, best practice and privacy problems on your web page. *coach-core* holds the JavaScript functionality to analyse your page, the [Coach project](https://github.com/sitespeedio/coach) is the CLI.

Execute this code after running `npm run combine && npm run terser`
The command needs to be rerun after the code changes
```js
const fs = require('fs');
const coach = require('./lib/index.js');
// Alternatively:
// const coach = require('coach-core');
  
// Get the JavaScript code that will analyse a page
const domAdviceJavaScript = await coach.getDomAdvice();

// Copy and execute the code in your browser console or via Puppeteer, Selenium, etc.
console.log(domAdviceJavaScript);

// Then save the result into the next line, it has to be a JSON object
const domResult = {
    "advice": [
        // ...
    ],
    "errors": {
        // ...
    },
    "url": "https://www.website.com/",
    "version": "8.1.1"
};
// Alternatively as a file (e.g., domResult.json):
// const har = JSON.parse(fs.readFileSync('./domResult.json', 'utf8'));

// Get the HAR from a browser (e.g., from Chrome DevTools, Puppeteer, or WebDriver)
// Then save the result into the next line, it has to be a JSON object
const har = {
    "log": {
        "version": "1.2",
        "creator": {
            "name": "WebInspector",
            "version": "537.36"
        },
        "pages": [
            {
                "startedDateTime": "2025-01-01T00:00:00.000Z",
                "id": "page_1",
                "title": "https://www.website.com/",
                "pageTimings": {
                    "onContentLoad": 123.456,
                    "onLoad": 456.789
                }
            }
        ],
        "entries": [
            // this should be a list of entries
        ]
    }
}

// Alternatively as a file (e.g., website.har):
// const har = JSON.parse(fs.readFileSync('./website.har', 'utf8'));

// If your HAR contains multiple pages (multiple runs etc) you can use the API
// to get the page that you want
const firstPageHar = coach.pickAPage(har, 0);

const harResult = await coach.analyseHar(firstPageHar);

// Say that you got the result from the browser in domResult
// and the HAR result in harResult
const coachResult = coach.merge(domResult, harResult);

console.log('Coach analysis result:', coachResult);
```

[travis-image]: https://img.shields.io/travis/sitespeedio/coach-core/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/sitespeedio/coach-core