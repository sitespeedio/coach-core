// Score a Content-Security-Policy header on what it actually says, not on
// its byte length. The previous heuristic (deduct 50 if the policy is
// longer than 150 chars) didn't reflect any real-world property — strict
// CSPs with a few directives and a nonce easily exceed 150 chars; tight
// CSPs that lock down a single-page app are routinely 200+ chars. So we
// look at the directives instead:
//
//   no header                                          score 0
//   uses 'unsafe-inline' or 'unsafe-eval' (each)       score deductions
//   missing default-src and script-src                 small deduction
//   uses 'strict-dynamic' with a nonce or hash         neutralises the
//                                                      'unsafe-inline'
//                                                      penalty (browsers
//                                                      that understand
//                                                      strict-dynamic
//                                                      ignore unsafe-inline
//                                                      anyway, so a
//                                                      strict-dynamic
//                                                      policy is fine to
//                                                      ship even with
//                                                      unsafe-inline as a
//                                                      fallback for older
//                                                      browsers)
//
// References:
//   https://csp.withgoogle.com/docs/strict-csp.html
//   https://web.dev/articles/strict-csp
//   https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
const NONCE_RE = /(?:^|[\s;])'nonce-[A-Za-z0-9+/=_-]+'/i;
const HASH_RE = /(?:^|[\s;])'sha(?:256|384|512)-[A-Za-z0-9+/=_-]+'/i;
const STRICT_DYNAMIC_RE = /'strict-dynamic'/i;
const UNSAFE_INLINE_RE = /'unsafe-inline'/i;
const UNSAFE_EVAL_RE = /'unsafe-eval'/i;
const HAS_DEFAULT_SRC_RE = /(?:^|;)\s*default-src\b/i;
const HAS_SCRIPT_SRC_RE = /(?:^|;)\s*script-src(?:-elem|-attr)?\b/i;
const HAS_OBJECT_SRC_RE = /(?:^|;)\s*object-src\b/i;
const DEFAULT_SRC_NONE_RE = /(?:^|;)\s*default-src\s+[^;]*'none'/i;

function readHeader(asset) {
  const raw = asset.headers.response['content-security-policy'];
  if (!raw) return;
  // pagexray normalises headers to arrays of values per name.
  return Array.isArray(raw) ? raw[0] : raw;
}

export default {
  id: 'contentSecurityPolicyHeader',
  title:
    'Use a strict Content-Security-Policy header to mitigate cross-site scripting (XSS) attacks.',
  description:
    'A Content-Security-Policy response header tells the browser which sources of script, style, and other content are allowed. The most effective form is a strict CSP using nonces or hashes together with strict-dynamic; the worst is a missing header, with unsafe-inline and unsafe-eval close behind. https://web.dev/articles/strict-csp',
  weight: 5,
  severity: 'warn',
  tags: ['privacy', 'bestpractice', 'headers'],
  processPage: function (page) {
    const offending = [];
    let score = 0;
    const adviceParts = [];
    const finalUrl = page.finalUrl;
    for (const asset of page.assets) {
      if (asset.url !== finalUrl) {
        continue;
      }
      const value = readHeader(asset);
      if (!value) {
        offending.push(asset.url);
        adviceParts.push(
          'Set a Content-Security-Policy header to mitigate cross-site scripting attacks. You can start with a Content-Security-Policy-Report-Only header, which only reports violations rather than blocking them.'
        );
        continue;
      }

      score = 100;
      const hasStrictDynamic = STRICT_DYNAMIC_RE.test(value);
      const hasNonceOrHash = NONCE_RE.test(value) || HASH_RE.test(value);
      const looksStrict = hasStrictDynamic && hasNonceOrHash;

      if (UNSAFE_INLINE_RE.test(value) && !looksStrict) {
        score -= 40;
        adviceParts.push(
          "The policy allows 'unsafe-inline', which lets the browser execute inline scripts and styles directly from the page. Move to nonces or hashes plus 'strict-dynamic' so that inline injection cannot run."
        );
      }
      // If looksStrict: modern browsers ignore unsafe-inline when
      // strict-dynamic + nonces/hashes are present, so no penalty.

      if (UNSAFE_EVAL_RE.test(value)) {
        score -= 30;
        adviceParts.push(
          "The policy allows 'unsafe-eval', which lets the page call eval() and Function(). Almost no application needs this; remove it."
        );
      }

      const hasAnyDefault =
        HAS_DEFAULT_SRC_RE.test(value) || HAS_SCRIPT_SRC_RE.test(value);
      if (!hasAnyDefault) {
        score -= 20;
        adviceParts.push(
          'The policy declares no default-src or script-src directive, which means scripts can be loaded from anywhere. Add at least default-src so unknown directive types fall back to a safe value.'
        );
      }

      if (!HAS_OBJECT_SRC_RE.test(value) && !DEFAULT_SRC_NONE_RE.test(value)) {
        score -= 10;
        adviceParts.push(
          "Set object-src 'none' (or a default-src 'none' fallback) so the page cannot load Flash, plugins or other legacy embeddable content."
        );
      }

      if (looksStrict) {
        adviceParts.push(
          "The policy uses 'strict-dynamic' together with a nonce or hash — that is the recommended modern shape. Good."
        );
      }
    }

    if (score < 0) {
      score = 0;
    }
    return {
      score: score,
      offending: offending,
      advice: adviceParts.join(' ').trim()
    };
  }
};
