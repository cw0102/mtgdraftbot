import {popSample, sample, rotate, isNumber} from '../src/util.js';

test('popSample removes an item from the passed array and returns it', () => {
  const arr = [1, 2, 3];
  const popped = popSample(arr);
  expect(arr.length).toBe(2);
  expect(popped).toBeDefined();
});

test('popSample returns undefined for zero-length arrays', () => {
  const arr = [];
  const popped = popSample(arr);
  expect(arr.length).toBe(0);
  expect(popped).toBeUndefined();
});

test('sample chooses a random item from the passed array and returns it', () => {
  const arr = [1, 2, 3];
  const sampled = sample(arr);
  expect(arr.find((a) => a === sampled)).toBeDefined();
  expect(arr.length).toBe(3);
});

test('sample returns undefined for zero-length arrays', () => {
  const arr = [];
  const sampled = sample(arr);
  expect(arr.length).toBe(0);
  expect(sampled).toBeUndefined();
});

test('rotate properly rotates an array 1 place', () => {
  const arr = [1, 2, 3];
  rotate(arr, 1);
  expect(arr).toEqual([2, 3, 1]);
});

test('rotate properly rotates an array equal to its length', () => {
  const arr = [1, 2, 3];
  rotate(arr, arr.length);
  expect(arr).toEqual([1, 2, 3]);
});

test('rotate properly rotates an array negative 1 place', () => {
  const arr = [1, 2, 3];
  rotate(arr, -1);
  expect(arr).toEqual([3, 1, 2]);
});

test('rotate properly rotates an array equal to its negative length', () => {
  const arr = [1, 2, 3];
  rotate(arr, -arr.length);
  expect(arr).toEqual([1, 2, 3]);
});

test('isNumber returns false for an alpha string', () => {
  const alpha = 'asdfghjkl';
  expect(isNumber(alpha)).toBe(false);
  const alpha2 = 'ASDFGHJKL';
  expect(isNumber(alpha2)).toBe(false);
  const alpha3 = 'ASDFghjkl';
  expect(isNumber(alpha3)).toBe(false);
});

test('isNumber returns false for a mixed string', () => {
  const alpha = 'asdfGHJkl!@#$%^&*()1234567890';
  expect(isNumber(alpha)).toBe(false);
  const alpha2 = 'a 52';
  expect(isNumber(alpha2)).toBe(false);
});

test('isNumber returns true for a numeric string,', () => {
  const num = '1234';
  expect(isNumber(num)).toBe(true);
  const num2 = '555555';
  expect(isNumber(num2)).toBe(true);
});
