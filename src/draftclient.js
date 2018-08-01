'use strict';

import {v1 as uuidv1} from 'uuid';

/**
 * @callback textResponseCallback
 * @param {string} data
 * @returns {Promise} A promise with resolved data
 */

/**
 * @callback cardResponseCallback
 * @param {Array<object>} card_array
 * @returns {Promise} A promise with resolved data
 */

 /**
  * Represents a client in a draft
  */
export class DraftClient {
    /**
     * @param {string} name Client's name
     * @param {textResponseCallback} textCallback The callback to send text to the client.
     * @param {cardResponseCallback} cardChoiceCallback The callback to send cards to the client.
     */
    constructor(name, textCallback, cardChoiceCallback) {
        this.uuid = uuidv1();
        this.name = name;
        this.textCallback = textCallback;
        this.cardChoiceCallback = cardChoiceCallback;
        this.cards = [];
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
     * Adds a card to the client's collection
     * @param {Card} card The card to add to the client
     */
    draftCard(card) {
        this.cards.push(card);
    }
}
