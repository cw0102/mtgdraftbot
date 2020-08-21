'use strict';

/**
 * Given an array, selects a random element and pops it from the array.
 * This will modify the array.
 * @param {Array} array The array to sample
 * @return {any} The popped element
 */
export function popSample(array) {
  return array.splice(Math.floor(Math.random() * array.length), 1)[0];
}

/**
 * Given an array, selects a random element and returns it.
 * @param {Array} array The array to sample
 * @return {any} The sampled element
 */
export function sample(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Given an array, rotates the array `count` places to the left.
 * This operation happens on the array in place.
 * A negative value will rotate to the right.
 * @param {Array} arr The array to rotate
 * @param {number} count Number of places to shift
 */
export function rotate(arr, count) {
  const len = arr.length >>> 0; // convert to uint
  count = count >> 0; // convert to int

  // convert count to value in range [0, len)
  count = ((count % len) + len) % len;

  Array.prototype.push.apply(arr, Array.prototype.splice.call(arr, 0, count));
}

/**
 * Determines if the given argument is a number
 * @param {string} maybeNumber The string to test
 * @return {Boolean} If `maybeNumber` is a number
 */
export function isNumber(maybeNumber) {
  return !isNaN(parseFloat(maybeNumber)) && isFinite(maybeNumber);
}

/**
 * Flips a boolean coin with a probability of true equal to (numerator/denominator).
 * @param {number} numerator The numerator
 * @param {number} denominator The denominator
 * @return {Boolean} Whether the flip landed true or false
 */
export function rollFraction(numerator, denominator) {
  return Math.random() < (numerator / denominator);
}
