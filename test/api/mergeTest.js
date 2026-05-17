import test from 'ava';
import api from '../../lib/index.js';

test('Merge API / should work', (t) => {
  const har = [
    {
      advice: {
        performance: {
          adviceList: {
            fromHAR: {
              advice: '',
              description: '',
              id: 'fromHAR',
              offending: [],
              score: 100,
              tags: ['performance'],
              title: 'Advice from HAR',
              weight: 1
            }
          }
        }
      },
      score: 100
    }
  ];
  const dom = {
    advice: {
      performance: {
        adviceList: {
          fromDOM: {
            advice: '',
            description: '',
            id: 'fromDOM',
            offending: [],
            score: 0,
            tags: ['performance'],
            title: 'Advice from DOM',
            weight: 1
          }
        }
      }
    },
    score: 0
  };
  const result = api.merge(dom, har);
  t.is(Object.keys(result.advice.performance.adviceList).length, 2);
  t.is(result.advice.performance.score, 50);
});
