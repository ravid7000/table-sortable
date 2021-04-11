import memoize from 'fast-memoize';

const charCodeOfDot = '.'.charCodeAt(0);
const reEscapeChar = /\\(\\)?/g;
const rePropName = RegExp(
  // Match anything that isn't a dot or bracket.
  '[^.[\\]]+' + '|' +
  // Or match property names within brackets.
  '\\[(?:' +
  // Match a non-string expression.
  '([^"\'][^[]*)' + '|' +
  // Or match strings (supports escaping characters).
  '(["\'])((?:(?!\\2)[^\\\\]|\\\\.)*?)\\2' +
  ')\\]' + '|' +
  // Or match "" as the space between consecutive dots or empty brackets.
  '(?=(?:\\.|\\[\\])(?:\\.|\\[\\]|$))'
  , 'g');

/**
 * Converts `string` to a property path array.
 *
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
export const stringToPath = memoize((str: string) => {
  const result = []
  if (str.charCodeAt(0) === charCodeOfDot) {
    result.push('')
  }
  str.replace(rePropName, (match, expression, quote, subString) => {
    let key = match
    if (quote) {
      key = subString.replace(reEscapeChar, '$1')
    }
    else if (expression) {
      key = expression.trim()
    }
    result.push(key)
    return '';
  })
  return result
});

/**
 * Get value at key from object
 *
 * @param {string} key The key to access value.
 * @param {object} obj
 */
export const getIn = memoize((key: string, obj: Record<string, any>): any => {
  const path = stringToPath(key);

  let index = 0
  const length = path.length

  while (obj != null && index < length) {
    obj = obj[path[index++]];
  }
  return (index && index == length) ? obj : undefined
});