import {createBooster, CARD_RARITY_COMMON, CARD_RARITY_UNCOMMON,
  CARD_RARITY_RARE, CARD_RARITY_MYTHIC} from '../src/cards.js';
import {setExists} from '../src/sets.js';

test('Sets contains DOM', () => {
  expect(setExists('DOM')).toBe(true);
});

test('createBooster DOM returns the proper number and rarity of cards', () => {
  const booster = createBooster('DOM');
  expect(booster).toHaveLength(15);
  expect(booster.filter((v) => v.rarity === CARD_RARITY_RARE || v.rarity === CARD_RARITY_MYTHIC)).toHaveLength(1);
  expect(booster.filter((v) => v.rarity === CARD_RARITY_UNCOMMON)).toHaveLength(3);
  expect(booster.filter((v) => v.rarity === CARD_RARITY_COMMON)).toHaveLength(11);
  expect(booster.filter((v) => v.types.includes('Land')).length).toBeGreaterThanOrEqual(1);
  expect(booster.filter((v) => v.supertypes.includes('Legendary')).length).toBeGreaterThanOrEqual(1);
});

test('Sets contains M19', () => {
  expect(setExists('M19')).toBe(true);
});

test('createBooster M19 returns the proper number and rarity of cards', () => {
  const booster = createBooster('M19');
  expect(booster).toHaveLength(15);
  expect(booster.filter((v) => v.rarity === CARD_RARITY_RARE || v.rarity === CARD_RARITY_MYTHIC)).toHaveLength(1);
  expect(booster.filter((v) => v.rarity === CARD_RARITY_UNCOMMON )).toHaveLength(3);
  expect(booster.filter((v) => v.rarity === CARD_RARITY_COMMON)).toHaveLength(11);
  expect(booster.filter((v) => v.types.includes('Land') ).length).toBeGreaterThanOrEqual(1);
});

test('Sets contains WAR', () => {
  expect(setExists('WAR')).toBe(true);
});

test('createBooster WAR returns the proper number and rarity of cards', () => {
  const booster = createBooster('WAR');
  expect(booster).toHaveLength(15);
  expect(booster.filter((v) => v.rarity === CARD_RARITY_RARE || v.rarity === CARD_RARITY_MYTHIC)).toHaveLength(1);
  expect(booster.filter((v) => v.rarity === CARD_RARITY_UNCOMMON)).toHaveLength(3);
  expect(booster.filter((v) => v.rarity === CARD_RARITY_COMMON)).toHaveLength(11);
  expect(booster.filter((v) => v.types.includes('Land')).length).toBeGreaterThanOrEqual(1);
  expect(booster.filter((v) => v.types.includes('Planeswalker')).length).toBeGreaterThanOrEqual(1);
});
