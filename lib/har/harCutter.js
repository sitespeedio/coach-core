function groupBy(items, key) {
  const result = {};
  for (const item of items) {
    const bucket = item[key];
    (result[bucket] ||= []).push(item);
  }
  return result;
}

export function pickAPage(har, pageIndex) {
  if (har.log.pages[pageIndex] === undefined) {
    throw new TypeError('PageIndex out of range');
  } else {
    const myHar = structuredClone(har);

    // get the ID
    const pageId = myHar.log.pages[pageIndex].id;

    const resourcesByPage = groupBy(myHar.log.entries, 'pageref');
    myHar.log.entries = resourcesByPage[pageId];

    myHar.log.pages = [myHar.log.pages[pageIndex]];
    return myHar;
  }
}
