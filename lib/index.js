'use strict';

const fs = require('fs');
const pagexray = require('pagexray');
const path = require('path');
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

  async runHarAdvice(har, script, domAdvice, options) {
    if (!script) {
      script = await this.getHarAdvice();
    }

    options = merge({}, options);
    return harRunner.runAdvice(
      getPagesFromHar(har, options),
      script,
      domAdvice,
      options
    );
  },
  merge(domAdvice, harAdvice) {
    return merger(domAdvice, harAdvice);
  },
  pickAPage(har, pageIndex) {
    return pickAPage(har, pageIndex);
  },
  /*
  async run(url, domScript, harScript, options) {
    if (!domScript) {
      domScript = await this.getDomAdvice();
    }

    options = merge({}, options);
    const result = await runBrowsertime(url, domScript, options);
    if (
      Array.isArray(result.errors) &&
      result.errors.length !== 0 &&
      result.errors[0].length !== 0
    ) {
      const browsertimeError = new Error(result.errors);
      browsertimeError.name = 'BrowsertimeError';
      throw browsertimeError;
    }
    const domAdvice = result[0].browserScripts[0].coach.domAdvice;

    if (result.har) {
      const harAdvice = await this.runHarAdvice(
        result.har,
        harScript,
        domAdvice,
        options
      );
      return this.merge(domAdvice, harAdvice);
    } else {
      return domAdvice;
    }
  }*/
};
