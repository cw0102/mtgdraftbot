import { popSample, sample } from './util.js'

export { default as Sets } from '../data/AllSets.json'

export const basicLands = Object.freeze(['Forest', 'Island', 'Mountain', 'Swamp', 'Plains']);

export function createBooster(set) {
    const currentSet = Sets[set];
    const setMythics = currentSet["cards"].filter(card => card.rarity == "Mythic Rare");
    const setRares = currentSet["cards"].filter(card => card.rarity == "Rare");
    const setUncommons = currentSet["cards"].filter(card => card.rarity == "Uncommon");
    const setCommons = currentSet["cards"].filter(card => card.rarity == "Common");

    const packLayout = currentSet["booster"];

    const pack = [];

    for (let i = 0; i < packLayout.length; i++) {
        let current = packLayout[i];
        if (typeof current === Array) {
            if (current.length === 2 && current.includes("rare") && current.includes("mythic rare")) {
                if (Math.random() < 0.125) { // 1/8 of rare = mythic
                    pack.push(popSample(setMythics));
                } else {
                    pack.push(popSample(setRares));
                }
            }
        }
        if (current === "common") {
            pack.push(popSample(setCommons));
        } else if (current === "uncommon") {
            pack.push(popSample(setUncommons));
        } else if (current === "rare") {
            pack.push(popSample(setRares));
        } else if (current === "mythic rare") {
            pack.push(popSample(setMythics));
        } else if (current === "land") {
            if (set === "M19") {
                const dualLands = currentSet.filter((card) => {
                    ["Cinder Barrens", "Forsaken Sanctuary", "Foul Orchard",
                        "Highland Lake", "Meandering River", "Stone Quarry",
                        "Submerged Boneyard", "Timber Gorge", "Tranquil Expanse",
                        "Woodland Stream"].findIndex(card.name) != -1;
                });

                // 5/12 land slots are dual tap lands in M19
                // https://twitter.com/elishffrn/status/1011288839443267585
                if (Math.random() < 0.416667) { // 5/12 ~= 0.416667
                    pack.push(sample(dualLands));
                } else {
                    pack.push(sample(basicLands));
                }
            } else {
                pack.push(sample(basicLands));
            }
        }
    }

    return pack;
}