#!/usr/bin/env node

import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, basename, extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import filter from 'filter-files';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const packageInfo = require('../package.json');

const filterJsFiles = (file) => extname(file) === '.js';
const filterDirs = (file, dir) =>
  statSync(resolve(dir, file)).isDirectory();

const fileContentsByName = (scripts, file) => {
  const name = basename(file, '.js');
  scripts[name] = readFileSync(file, 'utf8');
  return scripts;
};

export default function combine(filename) {
  const utilsSrc = readFileSync(join(__dirname, '../lib/dom/util.js')),
    calculateScoreSrc = readFileSync(
      join(__dirname, 'calculateScore.js')
    ),
    categoriesPath = join(__dirname, '../lib/dom');

  const categoryDirs = filter.sync(categoriesPath, filterDirs, false);

  const scriptsByCategory = categoryDirs.reduce((byCategory, categoryDir) => {
    const categoryName = basename(categoryDir);
    byCategory[categoryName] = filter
      .sync(categoryDir, filterJsFiles, false)
      .reduce(fileContentsByName, {});
    return byCategory;
  }, {});

  const pushResultsSrc = Object.keys(scriptsByCategory)
    .map((categoryId) => {
      let scriptsById = scriptsByCategory[categoryId];
      let pushResultsSrc = Object.keys(scriptsById)
        .map(
          (scriptId) =>
            `try {
            ${categoryId}Results["${scriptId}"] = ${scriptsById[scriptId]}
          } catch(err) {
            ${categoryId}Errors["${scriptId}"] = err.message;
          }`
        )
        .join('\n');

      // info got some special treatment since it is not an advice
      // just some interesting info
      let categoryResults;
      if (categoryId === 'info' || categoryId === 'timings') {
        categoryResults = `advice["${categoryId}"] = ${categoryId}Results;`;
      } else {
        categoryResults = `advice["${categoryId}"] = {
            'adviceList': ${categoryId}Results
          };`;
      }

      categoryResults += `
      if (Object.keys(${categoryId}Errors).length > 0) {
        errors["${categoryId}"] = ${categoryId}Errors;
      }`;

      return `
  var ${categoryId}Results = {},
      ${categoryId}Errors = {};

  ${pushResultsSrc}

  ${categoryResults}

  `;
    })
    .join('\n');

  const combinedSrc = `(function() {
  if (typeof window !== 'undefined') {
    ${utilsSrc}
    return (function(util) {
        var advice = {},
            errors = {};

        ${pushResultsSrc}

        ${calculateScoreSrc}

        return {
          'advice': advice,
          'errors': errors,
          'url': document.URL,
          'version': "${packageInfo.version}"
        };
      })(util);
    } else {
      console.error('Missing window or window document');
    }
  })();
`;

  writeFileSync(filename, combinedSrc);
}

// Run as CLI when invoked directly.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  combine(process.argv[2]);
}
