'use strict';
import Database from 'better-sqlite3';
import {Card} from './cards.js';

const DBPath = 'data/AllSets.sqlite';

/**
 * A set of cards
 */
class MTGSet {
  /**
     * Constructor for an MTGSet
     * @param {string} code The set code
     */
  constructor(code) {
    this.code = code;
    this.name = '';
    this.booster = [];
    this.cards = [];
    Object.seal(this);
  }
}

/**
 * Returns an object containing the cards and metadata of the set
 * @param {string} setCode The set code
 * @return {MTGSet} An array of the cards in the set
 */
export function getSet(setCode) {
  const database = new Database(DBPath);
  const result = new MTGSet(setCode);

  const querySet = database.prepare(`SELECT name, boosterV3 AS booster FROM sets WHERE code=?`);
  const setRow = querySet.get(setCode);
  if (querySet === undefined) {
    return undefined;
  }
  result.name = setRow.name;
  result.booster = JSON.parse(setRow.booster.replace(/'/g, '"'));

  const queryCards = database.prepare(`SELECT artist, convertedManaCost, colorIdentity, colors, flavorText, uuid, layout, manaCost, name, number, power, rarity, subtypes, supertypes, text, toughness, type, types FROM cards WHERE setCode=? AND number NOT LIKE '%★'`);
  const cardResult = queryCards.iterate(setCode);
  for (const card of cardResult) {
    result.cards.push(new Card(
        setCode,
        card.artist,
        card.convertedManaCost,
        card.colorIdentity.split(', '),
        card.colors.split(', '),
        card.flavorText,
        card.uuid,
        card.layout,
        card.manaCost,
        card.name,
        card.number,
        card.power,
        card.rarity,
        card.subtypes.split(', '),
        card.supertypes.split(', '),
        card.text,
        card.toughness,
        card.type,
        card.types.split(', '),
    ));
  }

  return result;
}

/**
 * Checks to see if a set with a given code exists.
 * @param {string} setCode The set code
 * @return {boolean} `true` if a set exists with the given code, else `false`
 */
export function setExists(setCode) {
  const database = new Database(DBPath);

  const query = database.prepare(`SELECT code FROM sets WHERE code=?`);
  const result = query.get(setCode);
  if (result === undefined) {
    return false;
  } else {
    return true;
  }
}
