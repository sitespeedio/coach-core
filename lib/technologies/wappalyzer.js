// Technology-fingerprint engine. Operates on the data format published by
// https://github.com/enthec/webappanalyzer (the community continuation of the
// original open-source Wappalyzer). Reimplemented in-tree as the upstream
// `wappalyzer-core` npm package is deprecated and ships with a Proprietary
// license tag despite being a tiny zero-dependency module.

const state = {
  technologies: [],
  categories: [],
  requires: [],
  categoryRequires: []
};

function toArray(value) {
  return Array.isArray(value) ? value : [value];
}

function slugify(string) {
  return String(string)
    .toLowerCase()
    .replaceAll(/[^a-z0-9-]/g, '-')
    .replaceAll(/--+/g, '-')
    .replaceAll(/(?:^-|-$)/g, '');
}

function parsePattern(pattern, isRegex = true) {
  if (
    typeof pattern === 'object' &&
    pattern !== null &&
    !Array.isArray(pattern)
  ) {
    return Object.fromEntries(
      Object.keys(pattern).map((key) => [key, parsePattern(pattern[key])])
    );
  }

  const { value, regex, confidence, version } = String(pattern)
    .split(String.raw`\;`)
    .reduce((attrs, attr, i) => {
      if (i) {
        const parts = attr.split(':');
        if (parts.length > 1) {
          attrs[parts.shift()] = parts.join(':');
        }
      } else {
        attrs.value = typeof pattern === 'number' ? pattern : attr;
        attrs.regex = new RegExp(
          isRegex
            ? attr
                .replaceAll('/', String.raw`\/`)
                .replaceAll(String.raw`\+`, '__escapedPlus__')
                .replaceAll('+', '{1,250}')
                .replaceAll('*', '{0,250}')
                .replaceAll('__escapedPlus__', String.raw`\+`)
            : '',
          'i'
        );
      }
      return attrs;
    }, {});

  return {
    value,
    regex,
    confidence: Number.parseInt(confidence || 100, 10),
    version: version || ''
  };
}

function transformPatterns(patterns, caseSensitive = false, isRegex = true) {
  if (!patterns) return [];

  if (
    typeof patterns === 'string' ||
    typeof patterns === 'number' ||
    Array.isArray(patterns)
  ) {
    patterns = { main: patterns };
  }

  const parsed = Object.keys(patterns).reduce((acc, key) => {
    acc[caseSensitive ? key : key.toLowerCase()] = toArray(patterns[key]).map(
      (pattern) => parsePattern(pattern, isRegex)
    );
    return acc;
  }, {});

  return 'main' in parsed ? parsed.main : parsed;
}

function resolveVersion({ version, regex }, match) {
  if (!version) return version;
  const matches = regex.exec(match);
  if (!matches) return version;

  let resolved = version;
  for (const [index, m] of matches.entries()) {
    if (String(m).length > 10) continue;

    const ternary = new RegExp(`\\\\${index}\\?([^:]+):(.*)$`).exec(version);
    if (ternary && ternary.length === 3) {
      resolved = version.replace(ternary[0], m ? ternary[1] : ternary[2]);
    }

    resolved = resolved
      .trim()
      .replaceAll(new RegExp(`\\\\${index}`, 'g'), m || '');
  }

  return resolved.replace(/\\\d/, '');
}

function getTechnology(name) {
  return [
    ...state.technologies,
    ...state.requires.flatMap(({ technologies }) => technologies),
    ...state.categoryRequires.flatMap(({ technologies }) => technologies)
  ].find(({ name: _name }) => name === _name);
}

function getCategory(id) {
  return state.categories.find(({ id: _id }) => id === _id);
}

function categoryPriority({ technology: { categories } }) {
  return categories.reduce(
    (max, id) => Math.max(max, getCategory(id).priority),
    0
  );
}

export function setTechnologies(data) {
  state.technologies = Object.keys(data).reduce((technologies, name) => {
    const {
      cats,
      certIssuer,
      cookies,
      cpe,
      css,
      description,
      dns,
      dom,
      excludes,
      headers,
      html,
      icon,
      implies,
      js,
      meta,
      pricing,
      probe,
      requires,
      requiresCategory,
      robots,
      scriptSrc,
      scripts,
      text,
      url,
      website,
      xhr
    } = data[name];

    technologies.push({
      categories: cats || [],
      certIssuer: transformPatterns(certIssuer),
      cookies: transformPatterns(cookies),
      cpe: cpe || null,
      css: transformPatterns(css),
      description: description || null,
      dns: transformPatterns(dns),
      dom: transformPatterns(
        typeof dom === 'string' || Array.isArray(dom)
          ? Object.fromEntries(
              toArray(dom).map((selector) => [selector, { exists: '' }])
            )
          : dom,
        true,
        false
      ),
      excludes: transformPatterns(excludes).map(({ value }) => ({
        name: value
      })),
      headers: transformPatterns(headers),
      html: transformPatterns(html),
      icon: icon || 'default.svg',
      implies: transformPatterns(implies).map(
        ({ value, confidence, version }) => ({
          name: value,
          confidence,
          version
        })
      ),
      js: transformPatterns(js, true),
      meta: transformPatterns(meta),
      name,
      pricing: pricing || [],
      probe: transformPatterns(probe, true),
      requires: transformPatterns(requires).map(({ value }) => ({
        name: value
      })),
      requiresCategory: transformPatterns(requiresCategory).map(
        ({ value }) => ({
          id: value
        })
      ),
      robots: transformPatterns(robots),
      scriptSrc: transformPatterns(scriptSrc),
      scripts: transformPatterns(scripts),
      slug: slugify(name),
      text: transformPatterns(text),
      url: transformPatterns(url),
      website: website || null,
      xhr: transformPatterns(xhr)
    });

    return technologies;
  }, []);

  const requiresMap = {};
  for (const technology of state.technologies.filter(
    ({ requires }) => requires.length
  ))
    for (const { name } of technology.requires) {
      if (!getTechnology(name)) {
        throw new Error(`Required technology does not exist: ${name}`);
      }
      (requiresMap[name] ||= []).push(technology);
    }

  state.requires = Object.keys(requiresMap).map((name) => ({
    name,
    technologies: requiresMap[name]
  }));

  const categoryRequiresMap = {};
  for (const technology of state.technologies.filter(
    ({ requiresCategory }) => requiresCategory.length
  ))
    for (const { id } of technology.requiresCategory) {
      (categoryRequiresMap[id] ||= []).push(technology);
    }

  state.categoryRequires = Object.keys(categoryRequiresMap).map((id) => ({
    categoryId: Number.parseInt(id, 10),
    technologies: categoryRequiresMap[id]
  }));

  state.technologies = state.technologies.filter(
    ({ requires, requiresCategory }) =>
      requires.length === 0 && requiresCategory.length === 0
  );
}

export function setCategories(data) {
  state.categories = Object.keys(data)
    .reduce((categories, id) => {
      const category = data[id];
      categories.push({
        id: Number.parseInt(id, 10),
        slug: slugify(category.name),
        ...category
      });
      return categories;
    }, [])
    .sort(({ priority: a }, { priority: b }) => (a > b ? -1 : 0));
}

function analyzeOneToOne(technology, type, value) {
  return technology[type].reduce((technologies, pattern) => {
    if (pattern.regex.test(value)) {
      technologies.push({
        technology,
        pattern: {
          ...pattern,
          type,
          value,
          match: pattern.regex.exec(value)[0]
        },
        version: resolveVersion(pattern, value)
      });
    }
    return technologies;
  }, []);
}

function analyzeOneToMany(technology, type, items = []) {
  return items.reduce((technologies, value) => {
    for (const pattern of technology[type] || []) {
      const matches = pattern.regex.exec(value);
      if (matches) {
        technologies.push({
          technology,
          pattern: { ...pattern, type, value, match: matches[0] },
          version: resolveVersion(pattern, value)
        });
      }
    }
    return technologies;
  }, []);
}

function analyzeManyToMany(technology, types, items = {}) {
  const [type, ...subtypes] = types.split('.');
  return Object.keys(technology[type]).reduce((technologies, key) => {
    const patterns = technology[type][key] || [];
    const values = items[key] || [];
    for (const _pattern of patterns) {
      const pattern = (subtypes || []).reduce(
        (p, subtype) => p[subtype] || {},
        _pattern
      );
      for (const value of values) {
        const matches = pattern.regex.exec(value);
        if (matches) {
          technologies.push({
            technology,
            pattern: { ...pattern, type, value, match: matches[0] },
            version: resolveVersion(pattern, value)
          });
        }
      }
    }
    return technologies;
  }, []);
}

export function analyze(items, technologies = state.technologies) {
  const oo = analyzeOneToOne;
  const om = analyzeOneToMany;
  const mm = analyzeManyToMany;

  const relations = {
    certIssuer: oo,
    cookies: mm,
    css: oo,
    dns: mm,
    headers: mm,
    html: oo,
    meta: mm,
    probe: mm,
    robots: oo,
    scriptSrc: om,
    scripts: oo,
    text: oo,
    url: oo,
    xhr: oo
  };

  try {
    return technologies
      .flatMap((technology) =>
        Object.keys(relations).flatMap(
          (type) =>
            items[type] && relations[type](technology, type, items[type])
        )
      )
      .filter(Boolean);
  } catch (error) {
    throw new Error(error.message || error.toString(), { cause: error });
  }
}

function resolveExcludes(resolved) {
  for (const { technology } of resolved) {
    for (const { name } of technology.excludes) {
      const excluded = getTechnology(name);
      if (!excluded) {
        throw new Error(`Excluded technology does not exist: ${name}`);
      }
      let index;
      do {
        index = resolved.findIndex(
          ({ technology: { name: n } }) => n === excluded.name
        );
        if (index !== -1) resolved.splice(index, 1);
      } while (index !== -1);
    }
  }
}

function resolveImplies(resolved) {
  let done;
  do {
    done = true;
    for (const { technology, confidence, lastUrl } of resolved) {
      for (const {
        name,
        confidence: _confidence,
        version
      } of technology.implies) {
        const implied = getTechnology(name);
        if (!implied) {
          throw new Error(`Implied technology does not exist: ${name}`);
        }
        if (
          !resolved.some(({ technology: { name: n } }) => n === implied.name)
        ) {
          resolved.push({
            technology: implied,
            confidence: Math.min(confidence, _confidence),
            version: version || '',
            lastUrl
          });
          done = false;
        }
      }
    }
  } while (resolved.length > 0 && !done);
}

export function resolve(detections = []) {
  const resolved = detections.reduce((acc, { technology, lastUrl }) => {
    if (acc.some(({ technology: { name } }) => name === technology.name)) {
      return acc;
    }
    let version = '';
    let confidence = 0;
    let rootPath;
    for (const {
      pattern,
      version: _version = '',
      rootPath: _rootPath
    } of detections.filter(
      ({ technology: _technology }) =>
        _technology && _technology.name === technology.name
    )) {
      confidence = Math.min(100, confidence + pattern.confidence);
      version =
        _version.length > version.length &&
        _version.length <= 15 &&
        (Number.parseInt(_version, 10) || 0) < 10_000
          ? _version
          : version;
      rootPath = rootPath || _rootPath || undefined;
    }
    acc.push({ technology, confidence, version, rootPath, lastUrl });
    return acc;
  }, []);

  resolveExcludes(resolved);
  resolveImplies(resolved);

  return resolved
    .sort((a, b) => (categoryPriority(a) > categoryPriority(b) ? 1 : -1))
    .map(
      ({
        technology: {
          name,
          description,
          slug,
          categories,
          icon,
          website,
          pricing,
          cpe
        },
        confidence,
        version,
        rootPath,
        lastUrl
      }) => ({
        name,
        description,
        slug,
        categories: categories.map((id) => getCategory(id)),
        confidence,
        version,
        icon,
        website,
        pricing,
        cpe,
        rootPath,
        lastUrl
      })
    );
}

export default { setTechnologies, setCategories, analyze, resolve };
