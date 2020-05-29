export function cleanString(string) {
  // Make lowercase & trim whitespace.
  let cleanString = string.toLowerCase().trim();
  // If last letter is 's' remove it.
  if (
    cleanString.substring(cleanString.length - 1, cleanString.length) === 's'
  ) {
    cleanString = cleanString.substring(0, cleanString.length - 1);
  }
  return cleanString;
}

export function unionOfTwoArrays(a, b) {
  // contains the elements of both set a and set b.
  const setA = new Set(a);
  const setB = new Set(b);
  return Array(new Set([...setA, ...setB]));
}

export function intersectionOfTwoArrays(a, b) {
  // contains those elements of set a that are also in set b.
  const setA = new Set(a);
  const setB = new Set(b);
  return Array(new Set([...setA].filter((x) => setB.has(x))));
}

export function differenceOfTwoArrays(a, b) {
  // contains those elements of set a that are not in set b.
  const setA = new Set(a);
  const setB = new Set(b);
  return Array(new Set([...setA].filter((x) => !setB.has(x))));
}
