import moment from 'moment';

export function convertStringToDate(date) {
  // input is string like 'MM/DD/YYYY'
  const sequelizeSafeDate = moment(date, 'MM-DD-YYYY');
  return sequelizeSafeDate;
}

export function getRelativeDateTime(operation, units, unitOfTime, time) {
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
  const today = moment();
  let processedDate;
  if (operation === 'subtract') {
    processedDate = today.subtract(units, unitOfTime);
  } else if (operation === 'add') {
    processedDate = today.add(units, unitOfTime);
  }
  if (time === 'startOfDay') {
    processedDate = processedDate.startOf('day');
  } else if (time === 'endOfDay') {
    processedDate = processedDate.endOf('day');
  }
  return processedDate;
}

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
  return Array.from(new Set([...a, ...b]));
}

export function intersectionOfTwoArrays(a, b) {
  // contains those elements of set a that are also in set b.
  return a.filter((x) => b.includes(x));
}

export function differenceOfTwoArrays(a, b) {
  // contains those elements of set a that are not in set b.
  return a.filter((x) => !b.includes(x));
}
