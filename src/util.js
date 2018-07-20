/**
 * Given an array, selects a random element and pops it from the array.
 * This will modify the array.
 * @param {Array} array The array to sample
 * @returns The popped element
 */
export function popSample(array) {
    return array.splice(Math.floor(Math.random() * array.length), 1)[0];
}

/**
 * Given an array, selects a random element and returns it.
 * @param {Array} array The array to sample
 */
export function sample(array) {
    return array[Math.floor(Math.random() * array.length)];
}