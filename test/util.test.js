import { popSample } from '../src/util.js'

test('popSample removes an item from the passed array and returns it', () => {
    let arr = [1, 2, 3];
    let popped = popSample(arr);
    expect(arr.length).toBe(2);
    expect(popped).toBeDefined();
});

test('popSample returns undefined for zero-length arrays', () => {
    let arr = [];
    let popped = popSample(arr);
    expect(arr.length).toBe(0);
    expect(popped).toBeUndefined();
});