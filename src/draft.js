'use strict';

import {DraftClient} from './draftclient.js';
import {Collection} from 'discord.js';
import {Sets, createBooster} from './cards.js';
import {rotate} from './util.js';

const defaultSet = 'M19';

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
  * Represents a Draft of any kind
  */
export class Draft {
    /**
     * Base constructor for a Draft
     * @param {Function} cleanupCallback Callback to close out a draft
     */
    constructor(cleanupCallback) {
        this._started = false;
        /**
         * @type {Collection<string, DraftClient>}
         */
        this.clients = new Collection();
        this.cleanupCallback = cleanupCallback;
    }

    /**
     * Create a client
     * @param {string} name The client's name
     * @param {textResponseCallback} textCallback The callback to send text to the client.
     * @param {cardChoiceCallback} cardChoiceCallback The callback to send cards to the client.
     * @param {cardPoolCallback} cardPoolCallback The callback to send the current pool to the client.
     * @return {string} UUID of the added client
     */
    addClient(name, textCallback, cardChoiceCallback, cardPoolCallback) {
        const dc = new DraftClient(name, textCallback, cardChoiceCallback, cardPoolCallback);
        this.clients.set(dc.uuid, dc);
        return dc.uuid;
    }

    /**
     * Drops a client from the draft. This may require
     * additional cleanup depending on the draft type.
     * @param {string} uuid The uuid of the client
     */
    dropClient(uuid) {
        if (this.clients.has(uuid)) {
            this.clients.delete(uuid);
        }
    }

    /**
     * @return {Boolean} If the draft has started or not
     */
    started() {
        return this._started;
    }

    /**
     * Begin the draft
     */
    start() {
        if (this._started) {
            return;
        }

        this._started = true;
        this.handle();
    }

    /**
     * Abstract function for handling the draft
     */
    async handle() {
        throw new Error('handle() is not implemented');
    }
}

/**
 * Abstract class to represent a selection Draft.
 * Children must define getPack() to source the packs.
 */
class PackDraft extends Draft {
    /**
     * @class PackDraft
     * @param {Function} cleanupCallback Callback to close out a draft
     */
    constructor(cleanupCallback) {
        super(cleanupCallback);
    }

    /**
     * Handle the PackDraft. Generate packs, send
     * them to clients, and collect picks, then
     * send the pool to clients.
     */
    async handle() {
        const clientsArray = this.clients.array();
        for (let round = 0; round < this.getPackCount(); round++) {
            const packs = this.clients.map(() => this.getPack(round));
            const packSize = packs[0].length;

            const getPickResult = async () => {
                const clientPromises = [];

                for (let slot = 0; slot < this.clients.size; slot++) {
                    clientPromises.push(clientsArray[slot].sendCardChoiceArray(packs[slot]));
                };

                return Promise.all(clientPromises);
            };

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

        for (let client of clientsArray) {
            client.sendPool();
        }

        this.cleanupCallback(this);
    }

    /**
     * Abstract function for generating a pack
     */
    getPack() {
        throw new Error('getPack() is not implemented');
    }

    /**
     * Abstract function for the number of rounds
     * of drafting
     */
    getPackCount() {
        throw new Error('getPackCount() is not implemented');
    }
}

/**
 * Represents a draft using 3 boosters from 1-3 sets.
 */
export class BoosterDraft extends PackDraft {
    /**
     * @constructor
     * @param {Function} cleanupCallback Callback to close out a draft
     * @param {string} set1 3 character set code for the 1st pack
     * @param {string} set2 3 character set code for the 2nd pack
     * @param {string} set3 3 character set code for the 3rd pack
     */
    constructor(cleanupCallback, set1, set2, set3) {
        super(cleanupCallback);
        this.setCodes = [set1, set2, set3];
        for (let i = 0; i < this.setCodes.length; i++) {
            if (!this.setCodes[i] || !Sets.hasOwnProperty(this.setCodes[i])) {
                this.setCodes[i] = defaultSet;
            }
        }
    }

    /**
     * Generate a booster from the given set for
     * the current round.
     * @param {number} round The current round number
     * @return {Array} The pack
     */
    getPack(round) {
        return createBooster(this.setCodes[round]);
    }

    /**
     * @return {number} The The number of packs in a BoosterDraft
     */
    getPackCount() {
        return 3;
    }
}

/**
 * Represents a limited pool using a single box of 6 boosters
 */
export class SealedDraft extends Draft {
    /**
     * @constructor
     * @param {Function} cleanupCallback Callback to close out a draft
     * @param {Array} setsArray An array of the set codes to use for packs.
     * Length must be a factor of 6. If a factor and less than 6, will be repeated to fill 6 packs.
     */
    constructor(cleanupCallback, setsArray) {
        super(cleanupCallback);
        this.setCodes = [];
        if (!setsArray) {
            setsArray = [];
        }
        if (6 % setsArray.length === 0) {
            const setsLoopCount = 6 / setsArray.length;
            for (let i=0; i < setsLoopCount; i++) {
                for (let j=0; j < setsArray.length; j++) {
                    const setCode = setsArray[j];
                    if (!setCode || !Sets.hasOwnProperty(setCode)) {
                        this.setCodes.push(defaultSet);
                    } else {
                        this.setCodes.push(setCode);
                    }
                }
            }
        } else {
            for (let i=0; i < 6; i++) {
                this.setCodes.push(defaultSet);
            }
        }
    }

    /**
     * Handle the SealedDraft. Send packs to clients and end.
     */
    async handle() {
        const clientsArray = this.clients.array();
        for (const client of clientsArray) {
            this.setCodes.forEach((set) => {
                client.draftPack(createBooster(set));
            });
        }

        clientsArray.forEach((client) => {
            client.sendPool();
        });

        this.cleanupCallback(this);
    }
}

/*
export class CubeDraft extends PackDraft {
    constructor(cube) {
        super();
    }
}
*/
