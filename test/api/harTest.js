import api from '../../lib/index.js';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { use, should } from 'chai';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);
should();

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('HAR APIs:', function() {
  describe('getHarAdvice', function() {
    it('should return at least one advice', () =>
      api.getHarAdvice().should.eventually.not.be.empty);

    it('should only return valid advice', () =>
      api.getHarAdvice().then((adviceList) => {
        for (const advice of adviceList.performance) {
          for (const property of [
            'id',
            'title',
            'description',
            'weight',
            'tags'
          ]) {
            advice.should.have.ownProperty(property);
          }
        }
      }));
  });

  describe('analyseHar', async function() {
    const harPath = join(
      __dirname,
      '..',
      'har',
      'files',
      'www.nytimes.com.har'
    );
    const har = JSON.parse(await readFile(harPath, 'utf8'));

    it('should output correct structure', () =>
      api.analyseHar(har).then((advicePerPage) => {
        advicePerPage.should.have.length(2);

        const firstPageAdvice = advicePerPage[0];

        firstPageAdvice.should.have.property('version');
        firstPageAdvice.should.have.nested.property('advice.performance');
      }));
  });
});
