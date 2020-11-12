'use strict';

const fs = require('fs');
const pagexray = require('pagexray');
const path = require('path');
const thirdPartyWeb = require('third-party-web');
const merger = require('./merge').merge;
const merge = require('lodash.merge');
const pickAPage = require('./har/harCutter').pickAPage;
const harRunner = require('./har');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

function getPagesFromHar(harJson, options) {
  return pagexray.convert(harJson, {
    includeAssets: true,
    firstParty: options.firstParty
  });
}

module.exports = {
  async getDomAdvice() {
    return readFile(
      path.resolve(__dirname, '..', 'dist', 'coach.min.js'),
      'utf8'
    );
  },
  async getHarAdvice() {
    // The folder structure looks something like this
    // har/
    // har/bestpractice/advice.js
    // har/performance/advice.js
    // files.js
    const harRootPath = path.resolve(__dirname, 'har');

    async function getFolders(path) {
      const result = [];
      const files = await readdir(path);
      for (let file of files) {
        const filePath = path + '/' + file;
        if ((await stat(filePath)).isDirectory()) {
          result.push(file);
        }
      }
      return result;
    }

    let folders = await readdir(harRootPath);
    // We are only interested in folders
    folders = await getFolders(harRootPath);
    const harAdvice = {};
    for (let folderName of folders) {
      harAdvice[folderName] = [];
      const categoryPath = path.resolve(__dirname, 'har', folderName);
      const files = await readdir(categoryPath);
      for (let fileName of files) {
        harAdvice[folderName].push(
          require(path.resolve(categoryPath, fileName))
        );
      }
    }
    return harAdvice;
  },

  async analyseHar(har, harAdvice, domAdviceResult, options) {
    if (!harAdvice) {
      harAdvice = await this.getHarAdvice();
    }

    options = merge({}, options);
    return harRunner.runAdvice(
      getPagesFromHar(har, options),
      harAdvice,
      domAdviceResult,
      options
    );
  },
  merge(domAdviceResult, harAdviceResult) {
    return merger(domAdviceResult, harAdviceResult);
  },
  pickAPage(har, pageIndex) {
    return pickAPage(har, pageIndex);
  },
  getThirdPartyWeb() {
    return thirdPartyWeb;
  },
  getPageXray() {
    return pagexray;
  }
};
