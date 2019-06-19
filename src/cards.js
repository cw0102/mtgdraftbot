'use strict';

import {rollFraction, popSample, sample} from './util.js';
import {getSet} from './sets.js';

export const basicLands = Object.freeze(['Forest', 'Island', 'Mountain', 'Swamp', 'Plains']);

/**
 * Representation of a Card
 */
export class Card {
    /**
     * @param {string} artist Artist name
     * @param {number} cmc Converted mana cost
     * @param {Array<string>} colorIdentity Color identity (EDH)
     * @param {Array<string>} colors Colors
     * @param {string} flavor Flavor text
     * @param {string} uuid Unique identifier
     * @param {string} layout Card layout type (e.g. normal, split, transform, etc.)
     * @param {string} manaCost The manacost (e.g. {2}{G}{G})
     * @param {string} name The card name (English)
     * @param {string} number The card number in its set
     * @param {string} power Power, if applicable
     * @param {string} rarity The rarity (e.g. common, uncommon, rare, mythic rare)
     * @param {Array<string>} subtypes The card's subtypes (e.g. Goblin, Elf, Sliver)
     * @param {Array<string>} supertypes The card's supertypes (e.g. World, Basic)
     * @param {string} text The rules text of the card
     * @param {number} toughness Toughness, if applicable
     * @param {string} type The full type line
     * @param {Array<string>} types The card's types (e.g. Enchantment, Creature)
     */
    constructor(artist, cmc, colorIdentity, colors, flavor, uuid, layout, manaCost,
        name, number, power, rarity, subtypes, supertypes, text, toughness, type, types) {
        this.artist = artist;
        this.cmc = cmc;
        this.colorIdentity = colorIdentity;
        this.colors = colors;
        this.flavor = flavor;
        this.uuid = uuid;
        this.layout = layout;
        this.manaCost = manaCost;
        this.name = name;
        this.number = number;
        this.power = power;
        this.rarity = rarity;
        this.subtypes = subtypes;
        this.supertypes = supertypes;
        this.text = text;
        this.toughness = toughness;
        this.type = type;
        this.types = types;

        Object.freeze(this);
    }
}

// Booster rarity identifiers
const BOOSTER_RARITY_MYTHIC = 'mythic rare';
const BOOSTER_RARITY_RARE = 'rare';
const BOOSTER_RARITY_UNCOMMON = 'uncommon';
const BOOSTER_RARITY_COMMON = 'common';

// Card rarity identifiers
export const CARD_RARITY_MYTHIC = 'mythic';
export const CARD_RARITY_RARE = 'rare';
export const CARD_RARITY_UNCOMMON = 'uncommon';
export const CARD_RARITY_COMMON = 'common';

/**
 * A set of cards sorted by rarity
 */
class SortedCardSet {
    /**
     * Base constructor for SortedCardSet
     * @param {Array<Card>} cards Set of cards to sort
     */
    constructor(cards) {
        this.mythics = cards.filter((card) => card.rarity == CARD_RARITY_MYTHIC);
        this.rares = cards.filter((card) => card.rarity == CARD_RARITY_RARE);
        this.uncommons = cards.filter((card) => card.rarity == CARD_RARITY_UNCOMMON);
        this.commons = cards.filter((card) => card.rarity == CARD_RARITY_COMMON && !(card.supertypes.includes('Basic') && card.types.includes('Land')));
        this.basics = cards.filter((card) => card.supertypes.includes('Basic') && card.types.includes('Land')).reduce((prev, current) => {
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
    const currentSet = getSet(set);
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
            if (sortedCards.mythics.length > 0 && current.length === 2 && current.includes(BOOSTER_RARITY_RARE) && current.includes(BOOSTER_RARITY_MYTHIC)) {
                if (rollFraction(1, 8)) { // ~1/8 of rare = mythic
                    pack.push(popSample(sortedCards.mythics));
                } else {
                    pack.push(popSample(sortedCards.rares));
                }
            } else if (current.length === 2 && current.includes(BOOSTER_RARITY_UNCOMMON) && current.includes(BOOSTER_RARITY_RARE)) {
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
        if (current === BOOSTER_RARITY_COMMON) {
            pack.push(popSample(sortedCards.commons));
        } else if (current === BOOSTER_RARITY_UNCOMMON) {
            pack.push(popSample(sortedCards.uncommons));
        } else if (current === BOOSTER_RARITY_RARE) {
            pack.push(popSample(sortedCards.rares));
        } else if (current === BOOSTER_RARITY_MYTHIC) {
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
        removeFromPackLayout(packLayout, BOOSTER_RARITY_MYTHIC);
    } else if (randomRoll < 0.25) { // 7/32
        // give a rare
        pack.push(sample(legendsSorted.rares));
        removeFromPackLayout(packLayout, BOOSTER_RARITY_RARE);
    } else { // 24/32 = 3/4 = 0.75
        // give an uncommon
        pack.push(sample(legendsSorted.uncommons));
        removeFromPackLayout(packLayout, BOOSTER_RARITY_UNCOMMON);
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
    const randomRoll = Math.random();

    if (randomRoll < 0.03125) { // 1/32
        // give a mythic
        pack.push(sample(planeswalkersSorted.mythics));
        removeFromPackLayout(packLayout, BOOSTER_RARITY_MYTHIC);
    } else if (randomRoll < 0.25) { // 7/32
        // give a rare
        pack.push(sample(planeswalkersSorted.rares));
        removeFromPackLayout(packLayout, BOOSTER_RARITY_RARE);
    } else { // 24/32 = 3/4 = 0.75
        // give an uncommon
        pack.push(sample(planeswalkersSorted.uncommons));
        removeFromPackLayout(packLayout, BOOSTER_RARITY_UNCOMMON);
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

/**
 * Gets a link to Scryfall for the given set and card number
 * @param {string} set The set code, e.g. "M15"
 * @param {number} cardNumber The card number in the set
 * @return {string} A link to the card on Scryfall
 */
export function getScryfallLink(set, cardNumber) {
    return `http://scryfall.com/card/${set}/${cardNumber}`;
}
