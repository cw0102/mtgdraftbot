'use strict';

import {Client, User, Message, DMChannel} from 'discord.js';
import {discordToken} from './config.json';
import {Draft, BoosterDraft} from './draft.js';
import {isNumber} from './util.js';
import {EventEmitter} from 'events';

const client = new Client();

/**
 * Map of channelIDs to Drafts
 * discord id -> Draft
 * @type Map.<string, Draft>
 */
const channelMap = new Map();

/**
 * Wraps User details for use
 * in the userMap.
 */
class UserWrapper {
    /**
     * @constructor
     * @param {string} uuid The uuid of the user
     * @param {Draft} draft The current Draft the user is in
     */
    constructor(uuid, draft) {
        this.uuid = uuid;
        this.draft = draft;
    }
}

/**
 * Map of users to user info
 * discord id -> Draft
 * @type Map.<string, UserWrapper>
 */
const userMap = new Map();

const responseTimeLimit = 120000;
const responseEmitter = new EventEmitter();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('disconnect', () => {
    console.log(`Client disconnected`);
});

client.on('message', messageHandler);

/**
 * Send a DM to a user
 * @param {User} user
 * @param {string} msg
 */
function sendToClientDirect(user, msg) {
    let dmChannel = user.dmChannel;
    if (!dmChannel) {
        user.createDM().then((chan) => chan.send(msg), console.error);
    } else {
        dmChannel.send(msg).then((m) => console.log(`>From ${user}: ${m}`), console.error);
    }
}

/**
 * The callback to handle Text messages
 * @param {User} user The user
 * @param {string} text The text to pass to the user
 * @return {Promise<string>} The response from the user
 */
function textCallback(user, text) {
    sendToClientDirect(user, text);
    return Promise.resolve('');
}

/**
 * The callback to handle cardArray messages
 * @param {User} user The User
 * @param {Array} cardArray The card array to pass to the user
 * @return {Promise<Array>}
 */
function cardChoiceCallback(user, cardArray) {
    const text = cardArray.reduce((prev, current, index) => {
        return prev + `${index+1}: ${current.name}\n`;
    }, '');
    sendToClientDirect(user, text);
    return new Promise((resolve, reject) => {
        const responseFunction = (rmsg) => {
            const msgText = rmsg.toString();
            if (rmsg.author.id === user.id && isNumber(msgText)) {
                resolve(msgText+1);
                responseEmitter.removeListener('response', responseFunction);
            }
        };
        responseEmitter.on('response', responseFunction);
        /* setTimeout(() => {
            responseEmitter.removeListener('response', responseFunction);
            reject(`${user.username}#${user.discriminator} timed out`);
        }, responseTimeLimit);*/
    });
}

/**
 * Message handler
 * @param {Message} msg The incoming message
 */
function messageHandler(msg) {
    if (msg.channel instanceof DMChannel) {
        responseEmitter.emit('response', msg);
        return;
    }

    if (msg.content.startsWith('!')) {
        const commands = msg.content.substr(1).split(' ');
        switch (commands[0]) {
            case 'startdraft': {
                startDraft(msg, commands);
                break;
            }

            case 'begindraft': {
                beginDraft(msg);
                break;
            }

            case 'joindraft': {
                joinDraft(msg);
                break;
            }

            case 'stopdraft': {
                stopDraft(msg);
                break;
            }

            case 'help': {
                msg.reply('Help here!');
                break;
            }
        }
    }

    console.log(`From ${msg.author.username}#${msg.author.discriminator}: ${msg.content}`);
}

/**
 * Open a new draft in the current channel
 * @param {Message} msg The received message
 * @param {Array<string>} commands The full command path this command was called with
 */
function startDraft(msg, commands) {
    const channelid = msg.channel.id;
    if (!channelMap.has(channelid)) {
        let draftType = 'booster';
        if (commands.length >= 2) {
            draftType = commands[1];
        }

        let draftObj = null;
        switch (draftType) {
            /*
            case 'cube': {
                draftObj = new CubeDraft();
                break;
            }
            */

            /*
            case 'sealed': {
                draftObj = new SealedDraft();
                break;
            }
            */

            case 'booster':
            default: {
                draftObj = new BoosterDraft();
                msg.channel.send(`${msg.author} started a Booster Draft! The packs will use the following sets:\n Round 1: [M19], Round 2: [M19], Round 3: [M19]\n Type \`!joindraft\` to join. The creator can start the draft with \`!begindraft\`, or cancel it with \`!stopdraft\`.`);
                break;
            }
        }

        const uuid = draftObj.addClient(msg.author.id,
            (text) => textCallback(msg.author, text),
            (cardArray) => cardChoiceCallback(msg.author, cardArray)
        );
        userMap.set(msg.author.id, new UserWrapper(uuid, draftObj));

        channelMap.set(channelid, draftObj);
    } else {
        msg.channel.send('There is already an active session. Use \`!stopdraft\` to cancel it.');
    }
}

/**
 * Starts a draft with the currently joined users
 * @param {Message} msg The `!begindraft` Message object
 */
function beginDraft(msg) {
    const channelid = msg.channel.id;
    if (channelMap.has(channelid)) {
        const draft = channelMap.get(channelid);
        if (!draft.started()) {
            msg.channel.send(`Starting the draft with ${draft.clients.size} users!`);
            draft.start();
        } else {
            msg.channel.send('This channel already has an active draft!');
        }
    } else {
        msg.channel.send('There is not an active draft in this channel. Use \`!startdraft\` to start a draft, or \`!help\` for details.');
    }
}

/**
 * Joins the current channel's active draft
 * @param {Message} msg The `!joindraft` Message object
 */
function joinDraft(msg) {
    const channelid = msg.channel.id;
    if (channelMap.has(channelid)) {
        if (userMap.has(msg.author.id)) {
            msg.reply('You are already in a draft in another channel. Use \`!leavedraft\` to leave your current draft first.');
        } else {
            const draft = channelMap.get(channelid);
            const uuid = draft.addClient(msg.author.id,
                (text) => textCallback(msg.author, text),
                (cardArray) => cardChoiceCallback(msg.author, cardArray)
            );
            userMap.set(msg.author.id, new UserWrapper(uuid, draftObj));
            msg.channel.send(`${msg.author} joined the draft!`);
        }
    } else {
        msg.channel.send('There is not an active draft in this channel. Use \`!startdraft\` to start a draft, or \`!help\` for details.');
    }
}

/**
 * Stops the current channel's running draft.
 * @param {string} msg The `!stopdraft` Message object
 */
function stopDraft(msg) {
    const channelid = msg.channel.id;
    if (channelMap.has(channelid)) {
        msg.channel.send('Ending the current session.');
        channelMap.delete(channelid);
    } else {
        msg.channel.send('There is no active session.');
    }
}


if (discordToken && discordToken.length >= 0) {
    client.login(discordToken);
} else {
    throw new Error('Invalid discord_token');
}
