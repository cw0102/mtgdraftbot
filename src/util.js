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

/**
 * Given an array, rotates the array `count` places to the left.
 * This operation happens on the array in place.
 * @param {Array} arr The array to rotate
 * @param {number} count Number of places to shift
 */
export function rotate(arr, count) {
    let len = arr.length >>> 0; // convert to uint
    count = count >> 0; // convert to int

    // convert count to value in range [0, len)
    count = ((count % len) + len) % len;

    Array.prototype.push.apply(arr, Array.prototype.splice.call(arr, 0, count));
    return count;
}