"use strict";

import { DraftClient } from './draftclient.js'
import { Collection } from 'discord.js'
import { Sets, createBooster } from './cards.js'

const defaultSet = 'M19';

class Draft {
    constructor() {
        this._started = false;
        this.clients = new Collection();
    }

    /**
     * 
     * @param {string} name The client's name
     * @param {Function} textCallback The callback to send text to the client.
     * @param {Function} cardCallback The callback to send cards to the client.
     * @returns {string} UUID of the added client
     */
    addClient(name, textCallback, cardCallback) {
        const c = new DraftClient(name, textCallback, cardCallback);
        this.clients.set(c.uuid, c);
        return c.uuid;
    }

    start() {
        if (this._started) {
            return;
        }

        this._started = true;
        // Launch async handler for each client
        // This is where the "magic" happens
    }

    cancel() {
        throw new "cancel() is not implemented";
    }
}

class PackDraft extends Draft {
    constructor() {
        super();
        this.round = 1;
    }

    getPack() {
        throw new "getPack() is not implemented";
    }
}

export class BoosterDraft extends PackDraft {
    constructor(set1, set2, set3) {
        super();
        this.set_codes = [set1, set2, set3];
        for (let i=0; i < this.set_codes.length; i++) {
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