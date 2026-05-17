(function (util) {
  'use strict';
  // AVIF and WebP routinely deliver 25–50% smaller files than JPEG and
  // PNG at the same perceived quality. Sites can ship them via:
  //
  //   * <picture> with one or more <source type="image/avif"> /
  //     "image/webp"> elements before the JPEG/PNG fallback <img>;
  //   * <img srcset> serving .avif / .webp candidates directly (with
  //     content-negotiation upstream choosing the right format).
  //
  // We flag <img> elements that are NOT covered by either of those —
  // i.e. plain JPEG/PNG/GIF with no modern alternative offered.
  // Inline data: URIs and SVGs are skipped (different concerns).
  const LEGACY_EXT_RE = /\.(jpe?g|png|gif|bmp)(?:[?#]|$)/i;
  const MODERN_EXT_RE = /\.(avif|webp|jxl)(?:[?#]|$)/i;

  function hasModernSourceSibling(img) {
    let parent = img.parentElement;
    if (!parent || parent.tagName !== 'PICTURE') {
      return false;
    }
    const sources = parent.querySelectorAll('source');
    for (const source of sources) {
      const type = (source.getAttribute('type') || '').toLowerCase();
      if (
        type === 'image/avif' ||
        type === 'image/webp' ||
        type === 'image/jxl'
      ) {
        return true;
      }
      const srcset = source.getAttribute('srcset') || '';
      if (MODERN_EXT_RE.test(srcset)) {
        return true;
      }
    }
    return false;
  }

  function hasModernSrcset(img) {
    const srcset = img.getAttribute('srcset') || '';
    return MODERN_EXT_RE.test(srcset);
  }

  const offending = [];
  let legacyOnly = 0;
  let total = 0;
  const images = document.querySelectorAll('img');
  for (let i = 0, len = images.length; i < len; i++) {
    const img = images[i];
    const src = img.currentSrc || img.src || '';
    if (!src || src.indexOf('data:') === 0) {
      continue;
    }
    // The image's own URL is already a modern format — fine.
    if (MODERN_EXT_RE.test(src)) {
      total++;
      continue;
    }
    // Not a recognised raster format we can speak about (e.g. .svg,
    // unknown extension, content-negotiated URL with no extension).
    if (!LEGACY_EXT_RE.test(src)) {
      continue;
    }
    total++;
    if (hasModernSourceSibling(img) || hasModernSrcset(img)) {
      continue;
    }
    legacyOnly++;
    offending.push(util.getAbsoluteURL(src));
  }

  let score = 100;
  let advice = '';
  if (total > 0 && legacyOnly > 0) {
    const ratio = legacyOnly / total;
    score = Math.round(100 * (1 - ratio));
    advice =
      'The page ships ' +
      util.plural(legacyOnly, 'image') +
      ' (out of ' +
      total +
      ') in JPEG/PNG/GIF without a modern alternative. Wrap them in a <picture> with a <source type="image/avif"> or "image/webp" before the legacy <img>, or serve modern formats from your image pipeline directly. AVIF and WebP usually deliver 25–50% smaller files at the same quality.';
  }

  return {
    id: 'modernImageFormats',
    title: 'Serve images in modern formats (AVIF, WebP)',
    description:
      'AVIF and WebP routinely deliver 25–50% smaller files than JPEG and PNG at the same perceived quality, and every browser version still under support understands at least one of them. Ship modern formats either through a <picture> element with <source type="image/avif"> / "image/webp" entries in front of the legacy <img>, or directly from a content-negotiating image pipeline that returns AVIF / WebP when the client accepts it. https://web.dev/articles/serve-images-webp',
    advice: advice,
    score: score,
    weight: 4,
    severity: 'warn',
    offending: offending,
    tags: ['performance', 'image']
  };
})(util);
