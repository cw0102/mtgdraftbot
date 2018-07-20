import { popSample, sample } from '../src/util.js'

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

test('sample chooses a random item from the passed array and returns it', () => {
    let arr = [1, 2, 3];
    let sampled = sample(arr);
    expect(arr.find((a) => a === sampled)).toBeDefined();
    expect(arr.length).toBe(3);
});

test('sample returns undefined for zero-length arrays', () => {
    let arr = [];
    let sampled = sample(arr);
    expect(arr.length).toBe(0);
    expect(sampled).toBeUndefined();
});