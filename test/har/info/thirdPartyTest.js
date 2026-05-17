import test from 'ava';
import har from '../../help/har.js';

test('Third-party info / surfaces third-party requests grouped by category', async (t) => {
  const result = await har.firstAdviceForTestFile('www.nytimes.com.har', {
    firstParty: 'nytimes\\.com'
  });
  const info = result.info.thirdparty;
  t.true(info.totalThirdPartyRequests > 0);
  t.true(info.thirdPartyTransferSizeBytes > 0);
  // nytimes pulls in ad / analytics / surveillance services that
  // third-party-web categorises.
  t.true(Object.keys(info.byCategory).length > 0);
  t.truthy(info.toolsByCategory);
});

test('Third-party info / always returns the expected shape', async (t) => {
  // Even on a small document, the helper should return the same shape so
  // downstream consumers can rely on it.
  const result = await har.firstAdviceForTestFile('referrerPolicy.har');
  const info = result.info.thirdparty;
  t.true('totalThirdPartyRequests' in info);
  t.true('thirdPartyTransferSizeBytes' in info);
  t.true('byCategory' in info);
  t.true('toolsByCategory' in info);
  t.true('offending' in info);
});
