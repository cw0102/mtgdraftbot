'use strict';

import {v1 as uuidv1} from 'uuid';

/**
 * @callback textResponseCallback
 * @param {string} data
 * @returns {Promise} A promise with resolved data
 */

/**
 * @callback cardChoiceCallback
 * @param {Array<object>} cardArray
 * @returns {Promise} A promise with resolved data
 */

 /**
  * @callback cardPoolCallback
  * @param {Array<object>} cardArray
  */

 /**
  * Represents a client in a draft
  */
export class DraftClient {
    /**
     * @param {string} name Client's name
     * @param {textResponseCallback} textCallback The callback to send text to the client.
     * @param {cardChoiceCallback} cardChoiceCallback The callback to send cards to the client.
     * @param {cardPoolCallback} cardPoolCallback The callback to send the current card pool to the client
     */
    constructor(name, textCallback, cardChoiceCallback, cardPoolCallback) {
        this.uuid = uuidv1();
        this.name = name;
        this.textCallback = textCallback;
        this.cardChoiceCallback = cardChoiceCallback;
        this.cardPoolCallback = cardPoolCallback;
        this.cards = new Map();
    }

    /**
     * Sends text to the client.
     * @param {string} text Text to send to the client.
     * @return {Promise} The text callback promise
     */
    sendText(text) {
        return this.textCallback(text);
    }

    /**
     * Sends a card array to the client
     * @param {Array} cardArray
     * @return {Promise} The card callback promise
     */
    sendCardChoiceArray(cardArray) {
        return this.cardChoiceCallback(cardArray);
    }

    /**
     * Send the client their pool
     */
    sendPool() {
        this.cardPoolCallback(this.cards);
    }

    /**
     * Adds a card to the client's collection
     * @param {Card} card The card to add to the client
     */
    draftCard(card) {
        this.cards.set(card, this.cards.has(card) ? this.cards.get(card) + 1 : 1);
    }

    /**
     * Adds an array of cards to the client's collection
     * @param {Array<Card>} cardArray The array of cards to add to the client
     */
    draftPack(cardArray) {
        cardArray.forEach((card) => {
            this.draftCard(card);
        });
    }
}
