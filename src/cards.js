'use strict';

import {rollFraction, popSample, sample} from './util.js';
import {readFileSync} from 'fs';

export const Sets = JSON.parse(readFileSync('data/AllSets.json'));

export const basicLands = Object.freeze(['Forest', 'Island', 'Mountain', 'Swamp', 'Plains']);

/*
export class Card {

    constructor() {
        this.artist = '';
        this.cmc = 0;
        this.colorIdentity = [];
        this.colors = [];
        this.flavor = '';
        this.id = '';
        this.imageName = '';
        this.layout = '';
        this.manaCost = '';
        this.multiverseid = 0;
        this.name = '';
        this.number = '';
        this.power = 0;
        this.rarity = '';
        this.subtypes = [];
        this.text = '';
        this.toughness = 0;
        this.type = '';
        this.types = [];

        Object.seal(this);
    }
}
*/

// Booster rarity identifiers
const MYTHIC_RARITY = 'mythic rare';
const RARE_RARITY = 'rare';
const UNCOMMON_RARITY = 'uncommon';
const COMMON_RARITY = 'common';

/**
 * A set of cards sorted by rarity
 */
class SortedCardSet {
    /**
     * Base constructor for SortedCardSet
     * @param {Array} cards Set of cards to sort
     */
    constructor(cards) {
        this.mythics = cards.filter((card) => card.rarity == 'Mythic Rare');
        this.rares = cards.filter((card) => card.rarity == 'Rare');
        this.uncommons = cards.filter((card) => card.rarity == 'Uncommon');
        this.commons = cards.filter((card) => card.rarity == 'Common');
        this.basics = cards.filter((card) => card.rarity == 'Basic Land').reduce((prev, current) => {
            if (!prev.has(current.name)) {
                prev.set(current.name, []);
            }
            prev.get(current.name).push(current);
            return prev;
        }, new Map());

        Object.seal(this);
    }
}

/**
 * Creates a random booster of the given `set`
 * @param {string} set 3 character set code
 * @return {Array} A pack of the given `set`
 */
export function createBooster(set) {
    const currentSet = Sets[set];
    const cards = currentSet.cards;
    const packLayout = currentSet['booster'].slice();

    const pack = [];

    if (set === 'DOM') {
        prePackageInsertDOM(cards, pack, packLayout);
    } else if (set === 'WAR') {
        prePackageInsertWAR(cards, pack, packLayout);
    }

    const sortedCards = new SortedCardSet(cards);

    for (let i = 0; i < packLayout.length; i++) {
        let current = packLayout[i];
        if (current instanceof Array) {
            if (sortedCards.mythics.length > 0 && current.length === 2 && current.includes(RARE_RARITY) && current.includes(MYTHIC_RARITY)) {
                if (rollFraction(1, 8)) { // ~1/8 of rare = mythic
                    pack.push(popSample(sortedCards.mythics));
                } else {
                    pack.push(popSample(sortedCards.rares));
                }
            } else if (current.length === 2 && current.includes(UNCOMMON_RARITY) && current.includes(RARE_RARITY)) {
                // ~1/3 of the slots for sets that share 2 rare and uncommon slots are rares
                // This is mostly really old sets: Arabian Nights, Fallen Empires, The Dark, Homelands.
                // This is an approximation. The real rarities of these sets were extremely convoluted
                // and based heavily on sheet layouts and print runs.
                if (rollFraction(1, 3)) {
                    pack.push(popSample(sortedCards.rares));
                } else {
                    pack.push(popSample(sortedCards.uncommons));
                }
            }
        }
        if (current === COMMON_RARITY) {
            pack.push(popSample(sortedCards.commons));
        } else if (current === UNCOMMON_RARITY) {
            pack.push(popSample(sortedCards.uncommons));
        } else if (current === RARE_RARITY) {
            pack.push(popSample(sortedCards.rares));
        } else if (current === MYTHIC_RARITY) {
            pack.push(popSample(sortedCards.mythics));
        } else if (current === 'land') {
            if (set === 'M19') {
                const m19DualLandNames = ['Cinder Barrens', 'Forsaken Sanctuary', 'Foul Orchard',
                'Highland Lake', 'Meandering River', 'Stone Quarry',
                'Submerged Boneyard', 'Timber Gorge', 'Tranquil Expanse',
                'Woodland Stream'];
                const dualLands = cards.filter((card) =>
                    m19DualLandNames.findIndex((cn) => cn === card.name) != -1
                );

                // 5/12 land slots are dual tap lands in M19
                // https://twitter.com/elishffrn/status/1011288839443267585
                if (rollFraction(5, 12)) {
                    pack.push(sample(dualLands));
                } else {
                    pack.push(sample(sortedCards.basics.get(sample(basicLands))));
                }
            } else if (set === 'GRN') {
                // All land slots in GRN are gates
                const GRNGateNames = ['Selesnya Guildgate', 'Boros Guildgate', 'Golgari Guildgate',
                    'Dimir Guildgate', 'Izzet Guildgate'];
                const gates = cards.filter((card) =>
                    GRNGateNames.findIndex((cn) => cn === card.name) != -1
                );
                pack.push(sample(gates));
            } else if (set === 'RNA') {
                // All land slots in RNA are gates
                const RNAGateNames = ['Rakdos Guildgate', 'Gruul Guildgate', 'Azorius Guildgate',
                    'Simic Guildgate', 'Orzhov Guildgate'];
                const gates = cards.filter((card) =>
                    RNAGateNames.findIndex((cn) => cn === card.name) != -1
                );
                pack.push(sample(gates));
            } else {
                pack.push(sample(sortedCards.basics.get(sample(basicLands))));
            }
        }
    }

    return pack;
}

/**
 * Insert the legendary slot for Dominaria (DOM)
 * @param {Array} cards The cards in the set
 * @param {Array} pack The pack to insert into (to add the cards)
 * @param {Array} packLayout The layout of the pack (to remove slots)
 */
function prePackageInsertDOM(cards, pack, packLayout) {
    const legends = cards.filter((card) => 'supertypes' in card && card.supertypes.includes('Legendary'));
    const legendsSorted = new SortedCardSet(legends);
    const randomRoll = Math.random();

    // With no common legendaries, in a pack there are 3 uncommons
    // and 1 rare, so the chance of putting a legendary into the
    // rare slot is 1/4. Mythic rares are a 1/8 chance of a rare,
    // so the chance of a mythic is 1/32, making the chance of a
    // normal rare 7/32 (1/4 = 8/32). Uncommons are the other 3/4.
    if (randomRoll < 0.03125) { // 1/32
        // give a mythic
        pack.push(sample(legendsSorted.mythics));
        removeFromPackLayout(packLayout, MYTHIC_RARITY);
    } else if (randomRoll < 0.25) { // 7/32
        // give a rare
        pack.push(sample(legendsSorted.rares));
        removeFromPackLayout(packLayout, RARE_RARITY);
    } else { // 24/32 = 3/4 = 0.75
        // give an uncommon
        pack.push(sample(legendsSorted.uncommons));
        removeFromPackLayout(packLayout, UNCOMMON_RARITY);
    }
}

/**
 * Insert the planeswalker slot for War of the Spark (WAR)
 * @param {Array} cards The cards in the set
 * @param {Array} pack The pack to insert into (to add the cards)
 * @param {Array} packLayout The layout of the pack (to remove slots)
 */
function prePackageInsertWAR(cards, pack, packLayout) {
    const planeswalkers = cards.filter((card) => card.types.includes('Planeswalker'));
    const planeswalkersSorted = new SortedCardSet(planeswalkers);

    if (randomRoll < 0.0714) {
        if (Math.random() < 0.125) {
            // give a mythic
            pack.push(sample(planeswalkersSorted.mythics));
            removeFromPackLayout(MYTHIC_RARITY);
        } else {
            // give a rare
            pack.push(sample(planeswalkersSorted.rares));
            removeFromPackLayout(RARE_RARITY);
        }
    } else if (randomRoll >= 0.0714 && randomRoll < 0.2857) {
        // give an uncommon
        pack.push(sample(planeswalkersSorted.uncommons));
        removeFromPackLayout(UNCOMMON_RARITY);
    }
}

/**
 * Recursively searches rarity trees to remove a specific card rarity
 * @param {Array} packLayout The packLayout array
 * @param {string} rarity The rarity to remove
 * @return {Boolean} Returns true if the rarity was removed, else false
 */
function removeFromPackLayout(packLayout, rarity) {
    for (let i = 0; i < packLayout.length; i++) {
        const current = packLayout[i];
        if (current instanceof Array) {
            if (current.includes(rarity)) {
                packLayout.splice(i, 1);
                return true;
            }
        } else {
            if (current === rarity) {
                packLayout.splice(i, 1);
                return true;
            }
        }
    }

    return false;
}
