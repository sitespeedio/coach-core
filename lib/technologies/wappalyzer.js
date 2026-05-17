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
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/--+/g, '-')
    .replace(/(?:^-|-$)/g, '');
}

function parsePattern(pattern, isRegex = true) {
  if (
    typeof pattern === 'object' &&
    pattern !== null &&
    !Array.isArray(pattern)
  ) {
    return Object.keys(pattern).reduce(
      (parsed, key) => ({
        ...parsed,
        [key]: parsePattern(pattern[key])
      }),
      {}
    );
  }

  const { value, regex, confidence, version } = String(pattern)
    .split('\\;')
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
                .replace(/\//g, '\\/')
                .replace(/\\\+/g, '__escapedPlus__')
                .replace(/\+/g, '{1,250}')
                .replace(/\*/g, '{0,250}')
                .replace(/__escapedPlus__/g, '\\+')
            : '',
          'i'
        );
      }
      return attrs;
    }, {});

  return {
    value,
    regex,
    confidence: parseInt(confidence || 100, 10),
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
  matches.forEach((m, index) => {
    if (String(m).length > 10) return;

    const ternary = new RegExp(`\\\\${index}\\?([^:]+):(.*)$`).exec(version);
    if (ternary && ternary.length === 3) {
      resolved = version.replace(ternary[0], m ? ternary[1] : ternary[2]);
    }

    resolved = resolved
      .trim()
      .replace(new RegExp(`\\\\${index}`, 'g'), m || '');
  });

  return resolved.replace(/\\\d/, '');
}

function getTechnology(name) {
  return [
    ...state.technologies,
    ...state.requires.map(({ technologies }) => technologies).flat(),
    ...state.categoryRequires.map(({ technologies }) => technologies).flat()
  ].find(({ name: _name }) => name === _name);
}

function getCategory(id) {
  return state.categories.find(({ id: _id }) => id === _id);
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
          ? toArray(dom).reduce(
              (acc, selector) => ({ ...acc, [selector]: { exists: '' } }),
              {}
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
  state.technologies
    .filter(({ requires }) => requires.length)
    .forEach((technology) =>
      technology.requires.forEach(({ name }) => {
        if (!getTechnology(name)) {
          throw new Error(`Required technology does not exist: ${name}`);
        }
        (requiresMap[name] ||= []).push(technology);
      })
    );
  state.requires = Object.keys(requiresMap).map((name) => ({
    name,
    technologies: requiresMap[name]
  }));

  const categoryRequiresMap = {};
  state.technologies
    .filter(({ requiresCategory }) => requiresCategory.length)
    .forEach((technology) =>
      technology.requiresCategory.forEach(({ id }) => {
        (categoryRequiresMap[id] ||= []).push(technology);
      })
    );
  state.categoryRequires = Object.keys(categoryRequiresMap).map((id) => ({
    categoryId: parseInt(id, 10),
    technologies: categoryRequiresMap[id]
  }));

  state.technologies = state.technologies.filter(
    ({ requires, requiresCategory }) =>
      !requires.length && !requiresCategory.length
  );
}

export function setCategories(data) {
  state.categories = Object.keys(data)
    .reduce((categories, id) => {
      const category = data[id];
      categories.push({
        id: parseInt(id, 10),
        slug: slugify(category.name),
        ...category
      });
      return categories;
    }, [])
    .sort(({ priority: a }, { priority: b }) => (a > b ? -1 : 0));
}

function analyzeOneToOne(technology, type, value) {
  return technology[type].reduce((technologies, pattern) => {
    if (pattern.regex.exec(value)) {
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
    (technology[type] || []).forEach((pattern) => {
      const matches = pattern.regex.exec(value);
      if (matches) {
        technologies.push({
          technology,
          pattern: { ...pattern, type, value, match: matches[0] },
          version: resolveVersion(pattern, value)
        });
      }
    });
    return technologies;
  }, []);
}

function analyzeManyToMany(technology, types, items = {}) {
  const [type, ...subtypes] = types.split('.');
  return Object.keys(technology[type]).reduce((technologies, key) => {
    const patterns = technology[type][key] || [];
    const values = items[key] || [];
    patterns.forEach((_pattern) => {
      const pattern = (subtypes || []).reduce(
        (p, subtype) => p[subtype] || {},
        _pattern
      );
      values.forEach((value) => {
        const matches = pattern.regex.exec(value);
        if (matches) {
          technologies.push({
            technology,
            pattern: { ...pattern, type, value, match: matches[0] },
            version: resolveVersion(pattern, value)
          });
        }
      });
    });
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
      .map((technology) =>
        Object.keys(relations)
          .map(
            (type) =>
              items[type] && relations[type](technology, type, items[type])
          )
          .flat()
      )
      .flat()
      .filter((t) => t);
  } catch (error) {
    throw new Error(error.message || error.toString());
  }
}

function resolveExcludes(resolved) {
  resolved.forEach(({ technology }) => {
    technology.excludes.forEach(({ name }) => {
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
    });
  });
}

function resolveImplies(resolved) {
  let done = false;
  do {
    done = true;
    resolved.forEach(({ technology, confidence, lastUrl }) => {
      technology.implies.forEach(
        ({ name, confidence: _confidence, version }) => {
          const implied = getTechnology(name);
          if (!implied) {
            throw new Error(`Implied technology does not exist: ${name}`);
          }
          if (
            resolved.findIndex(
              ({ technology: { name: n } }) => n === implied.name
            ) === -1
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
      );
    });
  } while (resolved.length && !done);
}

export function resolve(detections = []) {
  const resolved = detections.reduce((acc, { technology, lastUrl }) => {
    if (
      acc.findIndex(({ technology: { name } }) => name === technology.name) !==
      -1
    ) {
      return acc;
    }
    let version = '';
    let confidence = 0;
    let rootPath;
    detections
      .filter(
        ({ technology: _technology }) =>
          _technology && _technology.name === technology.name
      )
      .forEach(({ pattern, version: _version = '', rootPath: _rootPath }) => {
        confidence = Math.min(100, confidence + pattern.confidence);
        version =
          _version.length > version.length &&
          _version.length <= 15 &&
          (parseInt(_version, 10) || 0) < 10000
            ? _version
            : version;
        rootPath = rootPath || _rootPath || undefined;
      });
    acc.push({ technology, confidence, version, rootPath, lastUrl });
    return acc;
  }, []);

  resolveExcludes(resolved);
  resolveImplies(resolved);

  const priority = ({ technology: { categories } }) =>
    categories.reduce((max, id) => Math.max(max, getCategory(id).priority), 0);

  return resolved
    .sort((a, b) => (priority(a) > priority(b) ? 1 : -1))
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
