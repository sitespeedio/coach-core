# CHANGELOG - coach-core

## 8.0.0 - UNRELEASED - 2023 updates

## 7.2.1 - 2023-06-22
### Fixed
* Catch if local storage or session storage isn't accessible. 

## 7.2.0 - 2023-06-12
### Added
* Upgraded to third party web 0.23.0. [#98](https://github.com/sitespeedio/coach-core/pull/98).
* Upgraded to latest wappalyzer [#100](https://github.com/sitespeedio/coach-core/pull/100).
### Fixed
* Make sure to skip advice if Chrome is missing FCP [#95](https://github.com/sitespeedio/coach-core/pull/95).
* Update dev dependencies

## 7.1.3 - 2023-02-10
### Fixed
* Fixed exporting to work with ESM modules too.
## 7.1.2 - 2022-05-05
### Fixed
* Upgraded to PageXray 4.4.2 and Third Party Web 0.17.1.
## 7.1.1 - 2022-04-13
### Fixed
* Upgraded to PageXray 4.4.1 and Third Party Web 0.15.0.

## 7.1.0 - 2022-02-06
### Added
* Upgraded to PageXray 4.0.0.
* Upgraded to third party web 0.13.0.
## 7.0.0 - 2021-12-01

### Changed
* Moved AMP advice to best practice instead of privacy [#67](https://github.com/sitespeedio/coach-core/pull/67).
* Increased favicon max size advice from 5 to 10 kb [#68](https://github.com/sitespeedio/coach-core/pull/68)
* Renamed the fastRender advice to avoidRenderBlocking [#73](https://github.com/sitespeedio/coach-core/pull/73)
* Remove the third party async advice [#74](https://github.com/sitespeedio/coach-core/pull/74)
* Updated the layout shift advice to use cumulative layout shift [#75](https://github.com/sitespeedio/coach-core/pull/75)
* Changed id of the Google Tag Manager advice [#79](https://github.com/sitespeedio/coach-core/pull/79)
### Added
* Updated third-party-web to 0.12.6.
* Use Chrome(ium) render blocking information to know if a request is render blocking or not [#66](https://github.com/sitespeedio/coach-core/pull/66).
* Report offending JavaScript assets if the JavaScript max limits kicks in [#70](https://github.com/sitespeedio/coach-core/pull/70).
* New largest contentful paint advice [#76](https://github.com/sitespeedio/coach-core/pull/76).
* New first contentful paint advice [#77](https://github.com/sitespeedio/coach-core/pull/77).
* Added TBT in the CPU longtask advice [#80](https://github.com/sitespeedio/coach-core/pull/80).
* Report content and transfer size for offending URLs [#81](https://github.com/sitespeedio/coach-core/pull/81).
* Report offending assets with transfer/content size for page size limit [#82](https://github.com/sitespeedio/coach-core/pull/82).

### Fixed
* Fix cases when JQuery is undefined. Thank you [shubham jajodia](https://github.com/jajo-shubham) for PR [#64](https://github.com/sitespeedio/coach-core/pull/64).
* A better way to find offending layout shifters. Thank you [shubham jajodia](https://github.com/jajo-shubham) for PR [#65](https://github.com/sitespeedio/coach-core/pull/65).
* Removed mentions aboout server push [#69](https://github.com/sitespeedio/coach-core/pull/69)
* Added more information on how to debug CPU advice [#71](https://github.com/sitespeedio/coach-core/pull/71).

## 6.4.3 - 2021-07-21
### Fixed
* Updated to latest PageXray and Third patrty web 0.12.4.
## 6.4.2 - 2021-07-05

### Fixed
* Make sure JQuery refs are set back to original ref [#62](https://github.com/sitespeedio/coach-core/pull/62) see [#61](https://github.com/sitespeedio/coach-core/issues/61).
## 6.4.1 - 2021-06-23
### Fixed
* Use all headers for Wappalyzer (before only the main document was used) [#60](https://github.com/sitespeedio/coach-core/pull/60).
## 6.4.0 - 2021-06-02
### Added 
* Updated to PageXray 4.2.0 that adds support for getting render blocking info in Chrome.
* Update wappalyzer-core from 6.5.32 to 6.6.0 [#57](https://github.com/sitespeedio/coach-core/pull/57)

### Fixed
* Only look for GET request for private and caching headers [#55](https://github.com/sitespeedio/coach-core/pull/55). See [#53](https://github.com/sitespeedio/coach-core/issues/53).

## 6.3.3 - 2021-04-14
### Fixed
* Updated the link about FLOC to use https://www.eff.org/deeplinks/2021/03/googles-floc-terrible-idea.
## 6.3.2 - 2021-04-13
### Fixed
* Catch when you test a URL without a domain see https://github.com/sitespeedio/sitespeed.io/issues/3043
## 6.3.1 - 2021-04-09
### Fixed
* Better check for the new FLoC privacy advice.
## 6.3.0 - 2021-04-09
### Added
* New privacy advice that looks for header to disable of FLoC in Chrome.
## 6.2.0 - 2021-04-08
### Added 
* Updated to PageXray 4.1.0 and wappalyzer-core 6.5.32 [#51](https://github.com/sitespeedio/coach-core/pull/51).
## 6.1.0 - 2021-02-22
### Added 
* Added new privacy check that checks if Google reCAPTCHA is used [#49](https://github.com/sitespeedio/coach-core/pull/49).
## 6.0.1 - 2020-12-21
### Fixed
* Fixed the third party cookie advice description.
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
