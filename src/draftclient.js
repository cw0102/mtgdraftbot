import { v1 as uuidv1 } from 'uuid'

export class DraftClient {
    /**
     * @param {string} name Client's name
     * @param {Function} textCallback The callback to send text to the client.
     * @param {Function} cardCallback The callback to send cards to the client.
     */
    constuctor(name, textCallback, cardCallback) {
        this.uuid = uuidv1();
        this.name = name;
        this.textCallback = textCallback;
        this.cardCallback = cardCallback;
    }

    /**
     * Sends text to the client.
     * @param {string} text Text to send to the client.
     */
    sendText(text) {
        this.textCallback(text);
    }

    /**
     * Sends a card array to the client
     * @param {Array} card_array
     */
    sendCardArray(card_array) {
        this.cardCallback(card_array);
    }
}