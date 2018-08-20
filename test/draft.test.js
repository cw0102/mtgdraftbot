import {BoosterDraft, SealedDraft} from '../src/draft.js';

test('Default BoosterDraft has 3 valid setCodes', () => {
    const b = new BoosterDraft(() => {});
    expect(b.setCodes.length).toBe(3);
    b.setCodes.forEach((c) => {
        expect(c).toBeDefined();
    });
});

test('BoosterDraft parses set_code params', () => {
    let set1 = 'M19';
    let set2 = 'DOM';
    let set3 = 'M15';
    const b = new BoosterDraft(() => {}, set1, set2, set3);
    expect(b.setCodes[0]).toBe(set1);
    expect(b.setCodes[1]).toBe(set2);
    expect(b.setCodes[2]).toBe(set3);
});

test('Default SealedDraft has 6 valid setCodes', () => {
    const sealDraft = new SealedDraft(() => {});
    expect(sealDraft.setCodes.length).toBe(6);
    sealDraft.setCodes.forEach((c) => {
        expect(c).toBeDefined();
    });
});

test('Default SealedDraft parses a single set_code param', () => {
    const sealDraft = new SealedDraft(() => {}, ['M19']);
    sealDraft.setCodes.forEach((c) => {
        expect(c).toBe('M19');
    });
});

test('Default SealedDraft parses 2 set_code params', () => {
    const sealDraft = new SealedDraft(() => {}, ['M19', 'DOM']);
    expect(sealDraft.setCodes).toEqual(['M19', 'DOM', 'M19', 'DOM', 'M19', 'DOM']);
});

test('Default SealedDraft parses 3 set_code params', () => {
    const sealDraft = new SealedDraft(() => {}, ['M19', 'DOM', 'M15']);
    expect(sealDraft.setCodes).toEqual(['M19', 'DOM', 'M15', 'M19', 'DOM', 'M15']);
});

test('Default SealedDraft parses 6 set_code params', () => {
    const sealDraft = new SealedDraft(() => {}, ['M19', 'DOM', 'M15', 'RIX', 'AKH', 'HOU']);
    expect(sealDraft.setCodes).toEqual(['M19', 'DOM', 'M15', 'RIX', 'AKH', 'HOU']);
});

// SealedDraft M19 has 90 cards
