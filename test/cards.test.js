import {createBooster, Sets} from '../src/cards.js';

test('Sets contains DOM', () => {
    expect(Sets.hasOwnProperty('DOM')).toBe(true);
});

test('createBooster DOM returns the proper number and rarity of cards', () => {
    const booster = createBooster('DOM');
    expect(booster).toHaveLength(15);
    expect(booster.filter((v) => v.rarity === 'Rare' || v.rarity === 'Mythic Rare')).toHaveLength(1);
    expect(booster.filter((v) => v.rarity === 'Uncommon' )).toHaveLength(3);
    expect(booster.filter((v) => v.rarity === 'Common' )).toHaveLength(10);
    expect(booster.filter((v) => v.rarity === 'Basic Land' )).toHaveLength(1);
});

test('Sets contains M19', () => {
    expect(Sets.hasOwnProperty('M19')).toBe(true);
});

test('createBooster M19 returns the proper number and rarity of cards', () => {
    const booster = createBooster('M19');
    expect(booster).toHaveLength(15);
    expect(booster.filter((v) => v.rarity === 'Rare' || v.rarity === 'Mythic Rare')).toHaveLength(1);
    expect(booster.filter((v) => v.rarity === 'Uncommon' )).toHaveLength(3);
    expect(booster.filter((v) => v.rarity === 'Common' ).length).toBeGreaterThanOrEqual(10);
    expect(booster.filter((v) => v.types.includes('Land') ).length).toBeGreaterThanOrEqual(1);
});
