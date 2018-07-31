"use strict";

import { DraftClient } from './draftclient.js'
import { Collection } from 'discord.js'
import { Sets, createBooster } from './cards.js'
import { rotate } from './util.js'

const defaultSet = 'M19';

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

export class Draft {
    constructor() {
        this._started = false;
        /**
         * @type {Collection<string, DraftClient>}
         */
        this.clients = new Collection();
    }

    /**
     * Create a client
     * @param {string} name The client's name
     * @param {textResponseCallback} textCallback The callback to send text to the client.
     * @param {cardResponseCallback} cardCallback The callback to send cards to the client.
     * @returns {string} UUID of the added client
     */
    addClient(name, textCallback, cardCallback) {
        const dc = new DraftClient(name, textCallback, cardCallback);
        this.clients.set(dc.uuid, dc);
        return dc.uuid;
    }

    started() {
        return this._started;
    }

    start() {
        if (this._started) {
            return;
        }

        this._started = true;
        this.handle();
    }

    handle() {
        throw "handle() is not implemented";
    }

    cancel() {
        throw "cancel() is not implemented";
    }
}

/**
 * Abstract class to represent a selection Draft.
 * Children must define getPack() to source the packs.
 */
class PackDraft extends Draft {
    constructor() {
        super();
    }

    async handle() {
        const clientsArray = this.clients.array();
        for (let round = 0; round < this.getPackCount(); round++) {
            const packs = this.clients.map(() => this.getPack(round));
            const packSize = packs[0].length;

            const getPickResult = async () => {
                const clientPromises = [];

                for (let slot = 0; slot < this.clients.size; slot++) {
                    clientPromises.push(clientsArray[slot].sendCardArray(packs[slot]));
                };

                return Promise.all(clientPromises);
            }

            for (let pass = 0; pass < packSize; pass++) {
                try {
                    const pickResult = await getPickResult();
                    for (let slot = 0; slot < packs.length; slot++) {
                        clientsArray[slot].draftCard(packs[slot].splice(pickResult[slot], 1)[0]);
                    }
                    rotate(packs, round % 2 == 0 ? 1 : -1);
                } catch (error) {
                    console.error(`Pick Error: ${error}`);
                }
            }
        }
    }

    getPack() {
        throw "getPack() is not implemented";
    }

    getPackCount() {
        throw "getPackCount() is not implemented";
    }
}

export class BoosterDraft extends PackDraft {
    /**
     * @constructor
     * @param {string} set1 3 character set code for the 1st pack
     * @param {string} set2 3 character set code for the 2nd pack
     * @param {string} set3 3 character set code for the 3rd pack
     */
    constructor(set1, set2, set3) {
        super();
        this.set_codes = [set1, set2, set3];
        for (let i = 0; i < this.set_codes.length; i++) {
            if (!this.set_codes[i] || !Sets.hasOwnProperty(this.set_codes[i])) {
                this.set_codes[i] = defaultSet;
            }
        }
    }

    getPack(round) {
        return createBooster(this.set_codes[round]);
    }

    getPackCount() {
        return 3;
    }
}

/*
export class SealedDraft extends Draft {
    constructor (set1, set2, set3, set4, set5, set6) {
        super();
        this.set_codes = [set1, set2, set3, set4, set5, set6];
        for (let i=0; i < this.set_codes.length; i++) {
            if (!this.set_codes[i] || !Sets.hasOwnProperty(this.set_codes[i])) {
                this.set_codes[i] = kDefaultSet;
            }
        }
    }
}

export class CubeDraft extends PackDraft {
    constructor(cube) {
        super();
    }
}
*/