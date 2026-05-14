# CHANGELOG - coach-core

## 9.1.0 - 2026-05-14
### Added
* Updated to PageXraty 5.0.0 [#164](https://github.com/sitespeedio/coach-core/pull/164).

## 9.0.1 - 2026-05-07

### Fixed
* The `mimeTypes` HAR performance check no longer flags `204 No Content` responses as missing a recognised content type. A 204 response has no body, so there is nothing to attribute a MIME type to and the rule should not subtract score for it. Thank you [Nate Spector](https://github.com/nspector) for PR [#161](https://github.com/sitespeedio/coach-core/pull/161).
* The `nelHeader` and `reportingEndpointsHeader` HAR privacy rules are now weight 0 so they no longer pull on the aggregate score. Both rules are tagged `severity: 'info'` and describe genuinely opt-in observability headers — most sites have no Reporting-API endpoint to point them at and should not be docked privacy score for that. The advice still surfaces as informational, matching the established pattern in `mimeTypes` [#162](https://github.com/sitespeedio/coach-core/pull/162).

## 9.0.0 - 2026-05-05

### Breaking
* Migrate the package to ECMAScript Modules. `coach-core` is now ESM-only — CommonJS consumers need to switch to `import` (or dynamic `import()`). The minimum supported Node version is bumped from 18 to 20 to match the rest of the sitespeed.io family. Internal CJS conventions (`require`, `module.exports`, `__dirname`) are replaced with ESM equivalents; the public API surface and result shape are unchanged [#146](https://github.com/sitespeedio/coach-core/pull/146).
* The misspelled `survelliance` third-party category key is now spelled `surveillance` — small but visible behaviour change for any consumer that hard-coded the typo [#137](https://github.com/sitespeedio/coach-core/pull/137).

### Added
* New `severity` field on every rule result, with three tiers (`error` / `warn` / `info`) modelled on Lighthouse and axe. Severity is orthogonal to weight: weight controls how strongly a rule pulls on the aggregate score, severity tells a consumer how loudly to surface a finding. Existing `score` and `weight` are unchanged [#143](https://github.com/sitespeedio/coach-core/pull/143).
* New `interactionToNextPaint` DOM performance rule. INP replaced First Input Delay as a Core Web Vital in March 2026, but coach-core had rules for every other Web Vital (LCP, FCP, CLS) and was silently behind on the one Google now ranks against. The rule observes buffered `event` entries via PerformanceObserver, groups them by `interactionId` so a single user interaction's three events (pointerdown, pointerup, click) count as one, and reports the slowest. Thresholds match Google's published p75 cutoffs: ≤200ms good, 200–500ms needs improvement, >500ms poor. Synthetic tests rarely fire interactions, so the rule explicitly handles the no-measurement case rather than scoring zero — INP is best measured with real-user monitoring and the advice text says so [#155](https://github.com/sitespeedio/coach-core/pull/155).
* Four new DOM performance rules covering modern image best practices: `decodingAsync` flags `<img>` elements without a `decoding` hint so non-LCP image decode doesn't block the main thread; `lazyLoadingImages` flags below-the-fold images that aren't `loading="lazy"` (the threshold deliberately overshoots — more than two viewport heights below the current scroll position — so images just out of view aren't penalised); `modernImageFormats` flags `<img>` that ships a JPEG/PNG/GIF without an AVIF or WebP alternative through `<picture>` or its own `srcset`; `lcpImageHints` scores priority hints on the LCP image (`fetchpriority="high"` recommended, `loading="lazy"` forbidden) [#157](https://github.com/sitespeedio/coach-core/pull/157).
* Modern privacy / security header rules on the HAR side: `permissionsPolicyHeader`, `xContentTypeOptionsHeader` [#138](https://github.com/sitespeedio/coach-core/pull/138), and the cross-origin isolation trio `crossOriginOpenerPolicyHeader`, `crossOriginEmbedderPolicyHeader`, `crossOriginResourcePolicyHeader` [#139](https://github.com/sitespeedio/coach-core/pull/139).
* Two DOM privacy rules that the HAR side cannot see: `iframeSandbox` (flags cross-origin iframes without a sandbox attribute) and `referrerPolicy` (flags pages with no `<meta name="referrer">`) [#139](https://github.com/sitespeedio/coach-core/pull/139).
* New `sessionReplay` DOM privacy rule that flags pages embedding session-recording tools (Hotjar, FullStory, Microsoft Clarity, LogRocket, Smartlook, Mouseflow, Quantum Metric, Inspectlet, Lucky Orange, Crazy Egg). Kept separate from the surveillance rule because the remediation is different — these tools have legitimate uses but the privacy concern is real, so the advice is "configure input redaction, get explicit consent, know where the recordings live" rather than "stop using them" [#153](https://github.com/sitespeedio/coach-core/pull/153).
* New `nelHeader` and `reportingEndpointsHeader` HAR privacy rules — thin presence checks for the Network Error Logging and Reporting-API headers. Severity `info` because these are observability headers, not security baselines [#150](https://github.com/sitespeedio/coach-core/pull/150).
* Two DOM bestpractice rules: `viewport` (flags missing viewport meta, missing `width=device-width`, and the patterns that disable pinch-to-zoom) and `imageAltText` (flags `<img>` without an `alt` attribute, accepting `alt=""`, `role="presentation" / "none"` and `aria-hidden="true"` as valid markers for decorative images) [#140](https://github.com/sitespeedio/coach-core/pull/140).
* `lib/technologies/VERSION.json` records source URL, upstream SHA and sync date for the bundled fingerprint catalogue, exposed via a new `coach.getTechnologiesVersion()` accessor next to `getWappalyzerCoreVersion()` and `getThirdPartyWebVersion()` [#144](https://github.com/sitespeedio/coach-core/pull/144).

### Changed
* Score the Content-Security-Policy header on its directives instead of its byte length. The previous heuristic (deduct 50 if the header value was longer than 150 chars) didn't reflect any real-world property and the comparison was reading `.length` on the array of header values rather than on the value string, so the deduction never actually fired. The new rule deducts for `'unsafe-inline'` and `'unsafe-eval'`, for missing `default-src` / `script-src`, and for missing `object-src 'none'`; the `'unsafe-inline'` deduction is suppressed when `'strict-dynamic'` is paired with a nonce or hash, which is the modern strict-CSP shape [#151](https://github.com/sitespeedio/coach-core/pull/151).
* The `largestContentfulPaint` rule no longer scores `fetchpriority` and `loading` hints on the LCP image. Those checks moved into the new `lcpImageHints` rule above so a consumer can tell "the hero image is slow" apart from "the hero image's hints are wrong" — different remediations, separate scores [#157](https://github.com/sitespeedio/coach-core/pull/157).
* Modernise the rule set: delete `dom/bestpractice/spdy.js` (SPDY no longer in browsers since 2016); rewrite `dom/privacy/surveillance.js` to scan `<script src>` and `<iframe src>` for known surveillance hostnames using exact-suffix host matching (no more `document.domain`, no more substring matches); update `dom/privacy/ga.js` to also detect GA4 (`gtag` + `dataLayer` config with `G-…` measurement id); replace the "HTTP/3 is new" placeholder in `dom/performance/inlineCss.js` with real advice; reweight `amp` (10 → 1) and `jquery` (4 → 1); drop SPDY from `isHTTP2` [#138](https://github.com/sitespeedio/coach-core/pull/138).
* Refresh stale rule thresholds across the rule set: `metaDescription` 155 → 160 chars (matches Google's modern search-results display); `cacheHeadersLong` floor 30 days → 1 year (modern best practice for content-hashed URLs with `immutable`); `strictTransportSecurityHeader` max-age floor 6 months → 1 year (HSTS preload list minimum); `cacheHeaders` weight 30 → 6 (in line with the rest of the rule set, which sits at 1–10); `pageSize` 1 / 2 MB → 2 / 3 MB mobile / desktop (HTTP Archive 2024 medians); `cssSize` 120 / 400 KB → 150 / 500 KB; `javascriptSize` 120 / 500 KB → 250 / 800 KB; `optimalCssSize` 14.5 → 25 KB with the dated "magic number TCP window" framing dropped. Several rule descriptions and advice strings were rewritten to drop dated framings and to point at the modern reference [#154](https://github.com/sitespeedio/coach-core/pull/154).
* Extend the surveillance hostname list from 10 entries to 32, grouped and commented by company (X / Twitter, LinkedIn, TikTok, Snapchat, Pinterest, Reddit, Bing Ads, Yandex Metrica, Baidu Tongji on top of the existing Google / Meta / YouTube set). Session-replay tools deliberately stay out of this list and have their own rule [#152](https://github.com/sitespeedio/coach-core/pull/152).
* Tune severity on four rules that needed editorial intent rather than the weight-derived default: `thirdPartyPrivacy` (sharing user data with third parties) `info` → `warn`; `thirdParty` (too many third-party requests) `info` → `warn`; `spof` (frontend single point of failure) `info` → `error`; `googleTagManager` `info` → `warn` [#158](https://github.com/sitespeedio/coach-core/pull/158).
* Declare an explicit `severity` on the seven 9.0 rules that still leaned on the `severity.fromWeight()` fallback, so each value reflects editorial intent: `viewport` `warn`; `imageAltText` `info`; `iframeSandbox` `info`; `referrerPolicy` `warn`; `crossOriginOpenerPolicyHeader` `warn`; `crossOriginEmbedderPolicyHeader` `info`; `crossOriginResourcePolicyHeader` `info` [#159](https://github.com/sitespeedio/coach-core/pull/159).
* Sync the bundled technology catalogue (`lib/technologies/*.json`, `categories.json`, `groups.json`) from `enthec/webappanalyzer@c2855b46` (2026-04-17). About sixteen months of upstream churn since the previous sync, net ~36 000 lines of new fingerprints [#144](https://github.com/sitespeedio/coach-core/pull/144).
* Bump `third-party-web` to 0.29.0 [#145](https://github.com/sitespeedio/coach-core/pull/145).
* Drop `bluebird` from runtime dependencies — native promises cover everything coach-core needs and the package was effectively unused [#156](https://github.com/sitespeedio/coach-core/pull/156).
* Modernise the GitHub Actions workflow: bump `actions/checkout` to v6.0.2, `actions/setup-node` to v6.4.0 (with npm cache enabled), replace the deprecated apt-key Chrome install with a one-liner, replace the unmaintained third-party `xvfb-action` with `xvfb-run`, expand the Node matrix to 20 / 22 / 24, drop test/dom and test/api/domTest.js from `npm test` (test runner needs a separate rewrite — see #147 if you want them back). New `dependabot.yml` keeps SHA pins current going forward [#141](https://github.com/sitespeedio/coach-core/pull/141).
* Bump browsertime devDep to 27.0.0 (no runtime impact — coach-core has no runtime browsertime dep, only the dev test runner used to).

### Fixed
* HSTS rule no longer scores 100 silently on an HTTPS page that is missing the Strict-Transport-Security header. Several other rules had small typos and dead branches that masked their advice text or scoring: dangling template literals in the FCP / LCP "good" branches (advice was being built and discarded), an off-by-one in `fullyLoaded.js` that skipped the first resource, an operator-precedence bug in `unnecessaryHeaders.js` that silently broke the cache-control + expires check, an assignment instead of `-=` in `thirdPartyCookies.js` that flattened the score regardless of cookie count, plus dead `score;` and `if (score === undefined)` blocks in HSTS [#137](https://github.com/sitespeedio/coach-core/pull/137).
* Wappalyzer no longer attributes technologies named in a page's Content-Security-Policy header to the page itself. Wappalyzer regex-matches patterns like `s3[^ ]*amazonaws.com` against header values, so a benign CSP allowlist (Wikipedia's CSP names an S3 bucket to permit embedded photos) was getting attributed as "uses S3". The technology detector now strips `content-security-policy*` headers before handing the asset response to Wappalyzer, and pins the URL and HTML body to the document itself rather than letting them drift to a later asset in the loop [#149](https://github.com/sitespeedio/coach-core/pull/149).
* `lib/har/thirdParty.js` no longer mutates the imported `third-party-web` entity object's `categories` array — side-effects could leak across pages and across consumers [#137](https://github.com/sitespeedio/coach-core/pull/137).
* LCP "poor" advice text said "slower than 4.5 seconds" but the threshold is 4 seconds; text now matches the threshold [#137](https://github.com/sitespeedio/coach-core/pull/137).
* Restore the DOM-rule test infrastructure that had been silently dead since the browsertime 23 upgrade. The old runner called `loadAndWait` and `runScript` on a `BrowsertimeEngine` instance; those methods only exist on the internal `SeleniumRunner` class and were never on the public engine, so the tests blew up the moment they tried to register. The runner is now a thin wrapper around `selenium-webdriver` (drivers managed by Selenium Manager — no path config required), and the broken async-`describe` pattern in every DOM test file is replaced with the standard async `before` / `after` hooks. `npm test` continues to run the no-browser suites; `npm run test:browser` now actually drives a browser instead of silently no-op-ing [#148](https://github.com/sitespeedio/coach-core/pull/148).

## 8.1.3 - 2025-08-04
### Fixed
* Reverted svg images in avoidScalingImages check released in 8.1.2 since it was causing errors. Lets work on a fir for it later and revert it for now [#135](https://github.com/sitespeedio/coach-core/pull/135).

## 8.1.2 - 2025-08-01
### Fixed
* Don't check svg images in avoidScalingImages check, thank you [Marcus Müller](https://github.com/M-arcus) for PR [#129](https://github.com/sitespeedio/coach-core/pull/129).
* Add zstd to encoding check, thank you [Marcus Müller](https://github.com/M-arcus) for PR [#128](https://github.com/sitespeedio/coach-core/pull/128).
* Make sure we use wappalyzer that is MIT [#133](https://github.com/sitespeedio/coach-core/pull/133).

## 8.1.1 - 2024-12-28
### Fixed
* Fix broken minified release.

## 8.1.0 - 2024-12-28
### Added
* Use latest data from https://github.com/enthec/webappanalyzer [#114](https://github.com/sitespeedio/coach-core/pull/114).
* Use third part web 0.26.2 [#113](https://github.com/sitespeedio/coach-core/pull/113)

### Fixed
* Update dev dependencies  [#115](https://github.com/sitespeedio/coach-core/pull/115),  [#116](https://github.com/sitespeedio/coach-core/pull/116) and [#117](https://github.com/sitespeedio/coach-core/pull/117).

## 8.0.2 - 2023-08-31
### Fixed
* Another update to PageXray with a safer HTTP header check.

## 8.0.1 - 2023-08-31
### Fixed
* Updated PageXray.

## 8.0.0 - 2023-08-30
### Added
* Expose third party web and wappalyzer versions [#111](https://github.com/sitespeedio/coach-core/pull/111).

### Fixed
* Updated to Wappalyzer 6.10.66 [#110](https://github.com/sitespeedio/coach-core/pull/110).
* Updated third party web 0.24.0 [#108](https://github.com/sitespeedio/coach-core/pull/108).
* Fix correct LCP attribute [#107](https://github.com/sitespeedio/coach-core/pull/107).

### Changed
* Remove advice about disableFLoCHeader [#106](https://github.com/sitespeedio/coach-core/pull/106).

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
