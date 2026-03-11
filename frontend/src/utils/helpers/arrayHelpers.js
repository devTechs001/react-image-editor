// frontend/src/utils/helpers/arrayHelpers.js

/**
 * Move array element from one index to another
 * @param {Array} array - Source array
 * @param {number} from - Source index
 * @param {number} to - Destination index
 * @returns {Array} - New array with moved element
 */
export function moveArrayElement(array, from, to) {
  const newArray = [...array];
  const [removed] = newArray.splice(from, 1);
  newArray.splice(to, 0, removed);
  return newArray;
}

/**
 * Remove duplicates from array
 * @param {Array} array - Source array
 * @param {Function} keyFn - Optional key function for complex objects
 * @returns {Array} - Array without duplicates
 */
export function removeDuplicates(array, keyFn) {
  if (keyFn) {
    const seen = new Set();
    return array.filter(item => {
      const key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  return [...new Set(array)];
}

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Source array
 * @param {number} size - Chunk size
 * @returns {Array} - Array of chunks
 */
export function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Source array
 * @returns {Array} - Shuffled array
 */
export function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Sort array by key
 * @param {Array} array - Source array
 * @param {string|Function} key - Key name or key function
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} - Sorted array
 */
export function sortByKey(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key];
    const bVal = typeof key === 'function' ? key(b) : b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Group array by key
 * @param {Array} array - Source array
 * @param {string|Function} key - Key name or key function
 * @returns {Object} - Grouped object
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
}

/**
 * Find intersection of arrays
 * @param {Array} arrays - Arrays to find intersection
 * @returns {Array} - Intersection array
 */
export function intersection(...arrays) {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return [...arrays[0]];
  
  return arrays.reduce((a, b) => a.filter(c => b.includes(c)));
}

/**
 * Find union of arrays
 * @param {Array} arrays - Arrays to find union
 * @returns {Array} - Union array
 */
export function union(...arrays) {
  return removeDuplicates(arrays.flat());
}

/**
 * Find difference between arrays
 * @param {Array} array1 - First array
 * @param {Array} array2 - Second array
 * @returns {Array} - Difference array
 */
export function difference(array1, array2) {
  const set2 = new Set(array2);
  return array1.filter(item => !set2.has(item));
}

/**
 * Check if arrays are equal
 * @param {Array} array1 - First array
 * @param {Array} array2 - Second array
 * @returns {boolean} - Whether arrays are equal
 */
export function arraysEqual(array1, array2) {
  if (array1.length !== array2.length) return false;
  return array1.every((item, index) => item === array2[index]);
}

/**
 * Get last n items from array
 * @param {Array} array - Source array
 * @param {number} n - Number of items
 * @returns {Array} - Last n items
 */
export function takeLast(array, n) {
  return array.slice(-n);
}

/**
 * Get first n items from array
 * @param {Array} array - Source array
 * @param {number} n - Number of items
 * @returns {Array} - First n items
 */
export function takeFirst(array, n) {
  return array.slice(0, n);
}

/**
 * Flatten nested array
 * @param {Array} array - Nested array
 * @param {number} depth - Depth to flatten
 * @returns {Array} - Flattened array
 */
export function flattenArray(array, depth = 1) {
  return array.flat(depth);
}

/**
 * Zip arrays together
 * @param  {...Array} arrays - Arrays to zip
 * @returns {Array} - Zipped array
 */
export function zip(...arrays) {
  const maxLength = Math.max(...arrays.map(a => a.length));
  return Array.from({ length: maxLength }, (_, i) =>
    arrays.map(array => array[i])
  );
}

/**
 * Unzip zipped array
 * @param {Array} array - Zipped array
 * @returns {Array} - Unzipped arrays
 */
export function unzip(array) {
  if (array.length === 0) return [];
  return array[0].map((_, i) => array.map(row => row[i]));
}

export default {
  moveArrayElement,
  removeDuplicates,
  chunkArray,
  shuffleArray,
  sortByKey,
  groupBy,
  intersection,
  union,
  difference,
  arraysEqual,
  takeLast,
  takeFirst,
  flattenArray,
  zip,
  unzip
};
