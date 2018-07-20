import { BoosterDraft } from '../src/draft.js'

test('Default BoosterDraft has 3 valid set_codes', () => {
    let b = new BoosterDraft();
    expect(b.set_codes.length).toBe(3);
    for (let c of b.set_codes) {
        expect(c).toBeDefined();
    }
});

test('BoosterDraft parses set_code params', () => {
    let set1 = "M19", set2 = "DOM", set3 = "M15";
    let b = new BoosterDraft(set1, set2, set3);
    expect(b.set_codes[0]).toBe(set1);
    expect(b.set_codes[1]).toBe(set2);
    expect(b.set_codes[2]).toBe(set3);
});