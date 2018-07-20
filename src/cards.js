import { popSample } from './util.js'

export { default as Sets } from '../data/AllSets.json'

export function createBooster(set) {
    let current_set = Sets[set];
    let set_mythics = current_set["cards"].filter(card => card.rarity == "Mythic Rare");
    let set_rares = current_set["cards"].filter(card => card.rarity == "Rare");
    let set_uncommons = current_set["cards"].filter(card => card.rarity == "Uncommon");
    let set_commons = current_set["cards"].filter(card => card.rarity == "Common");

    let pack_layout = current_set["booster"];

    let pack = [];
    
    for (let i=0; i < pack_layout.length; i++) {
        let current = pack_layout[i];
        if (typeof current === Array) {
            if (current.length === 2 && current.includes("rare") && current.includes("mythic rare")) {
                if (Math.random() < 0.125) { // 1/8 of rare = mythic
                    pack.push(popSample(set_mythics));
                } else {
                    pack.push(popSample(set_rares));
                }
            }
        }
        if (current === "common") {
            pack.push(popSample(set_commons));
        } else if (current === "uncommon") {
            pack.push(popSample(set_uncommons));
        } else if (current === "rare") {
            pack.push(popSample(set_rares));
        } else if (curren === "mythic rare") {
            pack.push(popSample(set_mythics));
        }
    }

    return pack;
}