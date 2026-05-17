import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import pagexray from 'pagexray';
import thirdPartyWeb from 'third-party-web';
import { merge as mergeObjects } from './support/objectMerge.js';
import { merge as merger } from './merge.js';
import { pickAPage as pickAPageImpl } from './har/harCutter.js';
import { runAdvice } from './har/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const packageJSON = require('../package.json');
const technologiesVersion = require('./technologies/VERSION.json');

function getPagesFromHar(harJson, options) {
  return pagexray.convert(harJson, {
    includeAssets: true,
    firstParty: options.firstParty
  });
}

export async function getDomAdvice() {
  return readFile(resolve(__dirname, '..', 'dist', 'coach.min.js'), 'utf8');
}

export async function getHarAdvice() {
  // The folder structure looks something like this
  // har/
  // har/bestpractice/advice.js
  // har/performance/advice.js
  // files.js
  const harRootPath = resolve(__dirname, 'har');

  async function getFolders(rootPath) {
    const result = [];
    const files = await readdir(rootPath);
    for (let file of files) {
      const filePath = rootPath + '/' + file;
      if ((await stat(filePath)).isDirectory()) {
        result.push(file);
      }
    }
    return result;
  }

  const folders = await getFolders(harRootPath);
  const harAdvice = {};
  for (let folderName of folders) {
    harAdvice[folderName] = [];
    const categoryPath = resolve(__dirname, 'har', folderName);
    const files = await readdir(categoryPath);
    for (let fileName of files) {
      const moduleUrl = pathToFileURL(resolve(categoryPath, fileName)).href;
      const mod = await import(moduleUrl);
      harAdvice[folderName].push(mod.default);
    }
  }
  return harAdvice;
}

export async function analyseHar(har, harAdvice, domAdviceResult, options) {
  if (!harAdvice) {
    harAdvice = await getHarAdvice();
  }

  options = mergeObjects({}, options);
  return runAdvice(
    getPagesFromHar(har, options),
    harAdvice,
    domAdviceResult,
    options
  );
}

export function merge(domAdviceResult, harAdviceResult) {
  return merger(domAdviceResult, harAdviceResult);
}

export function pickAPage(har, pageIndex) {
  return pickAPageImpl(har, pageIndex);
}

export function getThirdPartyWeb() {
  return thirdPartyWeb;
}

export function getPageXray() {
  return pagexray;
}

export function getThirdPartyWebVersion() {
  return packageJSON.dependencies['third-party-web'];
}

export function getWappalyzerCoreVersion() {
  return packageJSON.dependencies['wappalyzer-core'];
}

export function getTechnologiesVersion() {
  return technologiesVersion;
}

export default {
  getDomAdvice,
  getHarAdvice,
  analyseHar,
  merge,
  pickAPage,
  getThirdPartyWeb,
  getPageXray,
  getThirdPartyWebVersion,
  getWappalyzerCoreVersion,
  getTechnologiesVersion
};
