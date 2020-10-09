function addToDateTime(units, unitOfTime, dateTime = new Date()) {
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;
  const week = 7 * day;
  const year = 365 * day;
  let multiplier;
  if (unitOfTime === 'hours') multiplier = hour;
  else if (unitOfTime === 'days') multiplier = day;
  else if (unitOfTime === 'weeks') multiplier = week;
  else if (unitOfTime === 'years') multiplier = year;
  const newDateTime = dateTime.getTime() + units * multiplier;
  return new Date(newDateTime);
}
function subtractFromDateTime(units, unitOfTime, dateTime = new Date()) {
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;
  const week = 7 * day;
  const year = 365 * day;
  let multiplier;
  if (unitOfTime === 'hours') multiplier = hour;
  else if (unitOfTime === 'days') multiplier = day;
  else if (unitOfTime === 'weeks') multiplier = week;
  else if (unitOfTime === 'years') multiplier = year;
  const newDateTime = dateTime.getTime() - units * multiplier;
  return new Date(newDateTime);
}
function convertStringToDate(dateStr) {
  // input is string like 'MM/DD/YYYY'
  const date = Date.parse(dateStr);
  const sequelizeSafeDate = new Date(date);
  return sequelizeSafeDate;
}
function getTodaysDateInUtc() {
  // always in utc
  const today = new Date();
  return today;
}
function getRelativeDateTimeInUtc(operation, units, unitOfTime, time) {
  // units = integer value
  if (typeof units !== 'number') return;
  // operation = 'subtract', 'add'
  if (operation !== 'subtract' && operation !== 'add') return;
  // unitOfTime = 'days', 'weeks', 'years'
  if (unitOfTime !== 'days' && unitOfTime !== 'weeks' && unitOfTime !== 'years')
    return;
  // time = 'currentTime', 'startOfDay', 'endOfDay'
  if (time !== 'currentTime' && time !== 'startOfDay' && time !== 'endOfDay')
    return;
  let processedDate;
  if (operation === 'subtract') {
    processedDate = subtractFromDateTime(units, unitOfTime);
  } else if (operation === 'add') {
    processedDate = addToDateTime(units, unitOfTime);
  }
  if (time === 'startOfDay') {
    processedDate = processedDate.setUTCHours(0, 0, 0, 0);
  } else if (time === 'endOfDay') {
    processedDate = processedDate.setUTCHours(23, 59, 59, 999);
  } else {
    processedDate = processedDate.setUTCHours();
  }
  return new Date(processedDate);
}
function cleanString(string) {
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
function unionOfTwoArrays(a, b) {
  // contains the elements of both set a and set b.
  return Array.from(new Set([...a, ...b]));
}
function intersectionOfTwoArrays(a, b) {
  // contains those elements of set a that are also in set b.
  return a.filter((x) => b.includes(x));
}
function differenceOfTwoArrays(a, b) {
  // contains those elements of set a that are not in set b.
  return a.filter((x) => !b.includes(x));
}

module.exports = {
  addToDateTime,
  subtractFromDateTime,
  convertStringToDate,
  getRelativeDateTimeInUtc,
  getTodaysDateInUtc,
  cleanString,
  unionOfTwoArrays,
  intersectionOfTwoArrays,
  differenceOfTwoArrays,
};
