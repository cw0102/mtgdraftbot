"use strict";

import { Client, User, Message, DMChannel } from 'discord.js';
import { discord_token } from "./config.json";
import { Draft, BoosterDraft } from './draft.js';
import { isNumber } from './util.js'
import { EventEmitter } from 'events'

const client = new Client();

/** 
 * Map of channelIDs to Drafts 
 * discord id -> Draft
 * @type Map.<string, Draft>
 */
const channelMap = new Map();

/**
 * Map of users to user info
 * discord id -> Draft
 * @type Map.<string, Draft>
 */
const userMap = new Map();

const responseTimeLimit = 90000;
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
 * @returns {Promise<string>} The response from the user
 */
function textCallback(user, text) {
    sendToClientDirect(user, text);
    return new Promise.resolve("");
}

/**
 * The callback to handle cardArray messages
 * @param {User} user The User
 * @param {string} cardArray The card array to pass to the user
 * @returns {Promise<Array>}
 */
function cardCallback(user, cardArray) {
    const text = cardArray.reduce((prev, current, index) => {
        return prev + `${index}: ${current.name}\n`
    }, "");
    sendToClientDirect(user, text);
    return new Promise((resolve, reject) => {
        const responseFunction = (rmsg) => {
            const msgText = rmsg.toString();
            if (rmsg.author.id === user.id && isNumber(msgText)) {
                resolve(msgText);
                responseEmitter.removeListener("response", responseFunction);
            }
        }
        responseEmitter.on("response", responseFunction);
        setTimeout(() => {
            responseEmitter.removeListener("response", responseFunction);
            reject("Timed out");
        }, responseTimeLimit);
    });
}

/**
 * Message handler
 * @param {Message} msg 
 */
function messageHandler(msg) {
    if (msg.channel instanceof DMChannel) {
        responseEmitter.emit("response", msg);
        return;
    }
    
    if (msg.content.startsWith("!")) {
        const commands = msg.content.substr(1).split(" ");
        switch(commands[0]) {
            case "startdraft": {
                startDraft(msg, commands);
                break;
            }

            case "begindraft": {
                beginDraft(msg);
                break;
            } 

            case "joindraft": {
                joinDraft(msg);
                break;
            } 

            case "stopdraft": {
                stopDraft(msg);
                break;
            }

            case "help": {
                msg.reply("Help here!");
                break;
            }
        }
    }

    console.log(`From ${msg.author}: ${msg.content}`);
}

/**
 * Implementation for `!startdraft`
 * @param {Message} msg The received message 
 * @param {Array<string>} commands The full command path this command was called with
 */
function startDraft(msg, commands) {
    const channelid = msg.channel.id;
    if (!channelMap.has(channelid)) {
        let draftType = "booster";
        if (commands.length >= 2) {
            draftType = commands[1];
        }

        let draftObj = null;
        switch (draftType) {
            /*
            case "cube": {
                draftObj = new CubeDraft();
                break;
            }
            */

            /*
            case "sealed": {
                draftObj = new SealedDraft();
                break;
            }
            */

            case "booster":
            default: {
                draftObj = new BoosterDraft();
                msg.channel.send(`${msg.author} started a Booster Draft! The packs will use the following sets:\n Round 1: [M19], Round 2: [M19], Round 3: [M19]\n Type \`!joindraft\` to join. The creator can start the draft with \`!begindraft\`, or cancel it with \`!stopdraft\`.`);
                break;
            }
        }

        let uuid = draftObj.addClient(msg.author.id, 
            (text) => textCallback(msg.author, text),
            (cardArray) => cardCallback(msg.author, cardArray)
        );
        userMap.set(msg.author.id, draftObj);

        channelMap.set(channelid, draftObj);
    } else {
        msg.channel.send("There is already an active session. Use \`!stopdraft\` to cancel it.");
    }
}

function beginDraft(msg) {
    const channelid = msg.channel.id;
    if (channelMap.has(channelid)) {
        const draft = channelMap.get(channelid);
        if (!draft.started()) {
            msg.channel.send(`Starting the draft with ${draft.clients.length} users!`);
            draft.start();
        }
    } else {
        msg.channel.send("There is not an active draft in this channel. Use \`!startdraft\` to start a draft, or \`!help\` for details.");
    }
}

function joinDraft(msg) {
    const channelid = msg.channel.id;
    if (channelMap.has(channelid)) {
        if (userMap.has(msg.author.id)) {
            msg.reply("You are already in a draft in another channel. Use \`!leavedraft\` to leave your current draft first.");
        } else {
            const draft = channelMap.get(channelid);
            draft.addClient(msg.author.id, 
                (text) => textCallback(msg.author, text),
                (cardArray) => cardCallback(msg.author, cardArray)
            );
            userMap.set(msg.author.id, draft);
            msg.channel.send(`${msg.author} joined the draft!`);
        }
    } else {
        msg.channel.send("There is not an active draft in this channel. Use \`!startdraft\` to start a draft, or \`!help\` for details.");
    }
}

function stopDraft(msg) {
    const channelid = msg.channel.id;
    if (channelMap.has(channelid)) {
        msg.channel.send("Ending the current session.");
        channelMap.delete(channelid);
    } else {
        msg.channel.send("There is no active session.");
    }
}


if (discord_token && discord_token.length >= 0) {
    client.login(discord_token);
} else {
    throw "Invalid discord_token";
}