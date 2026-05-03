'use strict';

// Three-tier severity classification, modelled on Lighthouse / axe-core:
//   error = security hole, broken page, or broken Core Web Vital
//   warn  = noticeable issue users or tools should act on
//   info  = advisory / informational, depends on context
//
// Severity is intentionally orthogonal to weight. Weight controls how
// strongly a rule pulls on the aggregate score; severity tells a consumer
// how loudly to surface a finding regardless of weight. A high-weight
// performance hint and a low-weight security hole can have the same score
// impact but very different severities, and that distinction is what this
// field exists to capture.
const ERROR = 'error';
const WARN = 'warn';
const INFO = 'info';

// Fallback used by the runner and the merger for rules that haven't yet
// declared an explicit severity (older rules, plugin-supplied rules, etc).
// Newer rules should declare `severity` directly so the value reflects
// editorial intent, not an arithmetic guess from weight.
function fromWeight(weight) {
  if (typeof weight !== 'number') {
    return WARN;
  }
  if (weight >= 8) {
    return ERROR;
  }
  if (weight >= 4) {
    return WARN;
  }
  return INFO;
}

module.exports = { ERROR, WARN, INFO, fromWeight };
