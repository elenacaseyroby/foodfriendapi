export function downloadCSV(data) {}
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
