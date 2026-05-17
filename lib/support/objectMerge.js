const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function isNullish(value) {
  return value === undefined || value === null;
}

function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function canMergeInto(value) {
  return value !== null && typeof value === 'object';
}

function mergeInto(target, source) {
  for (const key of Object.keys(source)) {
    if (FORBIDDEN_KEYS.has(key)) continue;
    const sourceValue = source[key];
    const targetValue = target[key];
    if (Array.isArray(sourceValue)) {
      const into = Array.isArray(targetValue) ? targetValue : [];
      mergeInto(into, sourceValue);
      target[key] = into;
    } else if (isPlainObject(sourceValue)) {
      const into = canMergeInto(targetValue) ? targetValue : {};
      mergeInto(into, sourceValue);
      target[key] = into;
    } else if (sourceValue === undefined) {
      if (!(key in target)) target[key] = undefined;
    } else {
      target[key] = sourceValue;
    }
  }
}

export function merge(target, ...sources) {
  if (isNullish(target)) return target;
  for (const source of sources) {
    if (isNullish(source)) continue;
    mergeInto(target, source);
  }
  return target;
}
