# CHANGELOG - coach-core

## 6.0.0 - 2020-12-18
### Added
* Added Element Timings, Paint Timings and Largest Contentful Paint [#16](https://github.com/sitespeedio/coach-core/pull/16).
* Added CLS advice [#18](https://github.com/sitespeedio/coach-core/pull/18).
* Added Long Task advice [#17](https://github.com/sitespeedio/coach-core/pull/17).
* Added support for HTTP3 [#26](https://github.com/sitespeedio/coach-core/pull/26).
* New info section where we share info third party statistics from third party web [#29](https://github.com/sitespeedio/coach-core/pull/29).
* New technology section with where Wappalyzer is used to get info [#28](https://github.com/sitespeedio/coach-core/pull/28).
* Added advice to avoid third party cookies [#39](https://github.com/sitespeedio/coach-core/pull/39).
* Upgraded to PageXray 3.0.0 [#38](https://github.com/sitespeedio/coach-core/pull/38).
* Added advice to avoid fingerprinting [#37](https://github.com/sitespeedio/coach-core/pull/37).
### Changed
* Remove RUM Speed Index [#12](https://github.com/sitespeedio/coach-core/pull/12).
* Remove First Paint and timings calculated from the Navigation Timing API [#15](https://github.com/sitespeedio/coach-core/pull/15).
* Removed the advice for PUSH [#26](https://github.com/sitespeedio/coach-core/pull/26).
* Removed the accesibilty advice [#32](https://github.com/sitespeedio/coach-core/pull/32). If you are a sitespeed.io use `--axe`. It's better to use AXE-core that gives better advice than the old coach advice.
* Fully use the third-party-web to know about third parties instead of home grown solution.

### Tech
* Use const/let instead of var [#24](https://github.com/sitespeedio/coach-core/pull/24) and [#25](https://github.com/sitespeedio/coach-core/pull/25).
* Expose PageXray and third-party-web in the API [#23](https://github.com/sitespeedio/coach-core/pull/23).
* Updated dev dependencies.

### Fixed
* Testing for JQuery removed the $ reference on the page [#22](https://github.com/sitespeedio/coach-core/pull/22).

## 5.1.1 - 2020-08-18
### Fixed
* Updated third party web to 0.12.2.

## 5.1.0 - 2020-06-21
### Fixed
* Updated third party web to 0.12.0.

## 5.0.2 - 2020-06-20
### Fixed
* Updated to latest PageXray.

## 5.0.1 - 2020-03-23
### Fixed
* Remove NodeJS 12 limit. Running 10 is still ok.

## 5.0.0 - 2020-03-11
### Changed
* Moved out core functionality from the Coach to coach-core. For earlier releases checkout the [changelog in the coach](https://github.com/sitespeedio/coach/blob/master/CHANGELOG.md).
