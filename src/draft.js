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

    start() {
        if (this._started) {
            return;
        }

        this._started = true;
        handle();
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

    handle() {
        for (let round = 0; round < 3; round++) {

            const packs = this.clients.map(() => getPack(round));

            for (let pass = 0; pass < packs[0].length; pass++) {
                const clientPromises = [];

                for (let slot = 0; slot < packs.length; slot++) {
                    clientPromises.push(clients[slot].sendCardArray(packs[slot]));
                };

                Promise.all(clientPromises).then((values) => {
                    for (let slot = 0; slot < packs.length; slot++) {
                        clients[slot].draftCard(packs[slot].splice(values[slot], 1)[0]);
                    }
                    rotate(packs, 1);
                }, (reason) => { throw `Client promise failed: ${reason}`; });
            }
        }
    }

    getPack(round) {
        throw "getPack() is not implemented";
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