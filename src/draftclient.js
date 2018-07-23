import { v1 as uuidv1 } from 'uuid'

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

export class DraftClient {
    /**
     * @param {string} name Client's name
     * @param {textResponseCallback} textCallback The callback to send text to the client.
     * @param {cardResponseCallback} cardCallback The callback to send cards to the client.
     */
    constuctor(name, textCallback, cardCallback) {
        this.uuid = uuidv1();
        this.name = name;
        this.textCallback = textCallback;
        this.cardCallback = cardCallback;
        this.cards = [];
    }

    /**
     * Sends text to the client.
     * @param {string} text Text to send to the client.
     * @returns {Promise} The text callback promise
     */
    sendText(text) {
        return this.textCallback(text);
    }

    /**
     * Sends a card array to the client
     * @param {Array} card_array
     * @returns {Promise} The card callback promise
     */
    sendCardArray(card_array) {
        return this.cardCallback(card_array);
    }

    draftCard(card) {
        this.cards.push(card);
    }
}