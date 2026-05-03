import lodashMerge from 'lodash.merge';
import * as severity from './severity.js';

function recalculateScore(results) {
  var totalScore = 0,
    totalWeight = 0;

  Object.keys(results.advice).forEach((result) => {
    const category = results.advice[result];
    var categoryScore = 0,
      categoryWeight = 0,
      adviceList = category.adviceList;

    if (adviceList) {
      Object.keys(adviceList).forEach((adviceName) => {
        var advice = adviceList[adviceName];

        // Backfill severity on any rule that didn't declare one. This covers
        // older or plugin-supplied DOM rules whose IIFE return doesn't yet
        // include the field. The HAR runner already applies the same default.
        if (!advice.severity) {
          advice.severity = severity.fromWeight(advice.weight);
        }

        totalScore += advice.score * advice.weight;
        categoryScore += advice.score * advice.weight;

        totalWeight += advice.weight;
        categoryWeight += advice.weight;
      });
    }
    if (categoryWeight > 0) {
      category.score = Math.round(categoryScore / categoryWeight);
    }
  });

  results.advice.score = Math.round(totalScore / totalWeight);
  return results;
}

export function merge(domResult, harResult) {
  const result = lodashMerge(domResult, harResult[0]);
  return recalculateScore(result);
}
