export function popSample(array) {
    if (array.length > 0) {
        return array.splice(Math.floor(Math.random() * array.length), 1)[0];
    } else {
        return undefined;
    }
}