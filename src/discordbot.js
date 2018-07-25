import { Client, User, Message, DMChannel } from 'discord.js';
import { discord_token } from "./config.json";
import { Draft, BoosterDraft } from './draft.js';

class UserWrapper {
    constructor(id, uuid, draft) {
        this.id = id;
        this.uuid = uuid;
        this.draft = draft;
    }
}

const client = new Client();

/** 
 * Map of channelIDs to Drafts 
 * @type Map.<string, Draft>
 */
const channelMap = new Map();

/**
 * Map of users to user info
 * discord id -> UserWrapper
 * @type Map.<string, UserWrapper>
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
        dmChannel.send(msg).then(console.log, console.error);
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
            if (rmsg.author.id === user.id){
                resolve(rmsg);
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
                const channelid = msg.channelid;
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
                    userMap.set(msg.author.id, new UserWrapper(msg.author.id, uuid, draftObj));

                    channelMap.set(channelid, draftObj);
                } else {
                    msg.channel.send("There is already an active session. Use \`!stopdraft\` to cancel it.");
                }
            } break;

            case "begindraft": {

            } break;

            case "joindraft": {
                if (channelMap.has(channelid)) {

                } else {

                }
            } break;

            case "stopdraft": {
                const channelid = msg.channelid;
                if (channelMap.has(channelid)) {
                    msg.reply("Ending the current session.");
                    channelMap.delete(channelid);
                } else {
                    msg.reply("There is no active session.");
                }
            } break;

            case "help": {
                msg.reply("Help here!");
            } break;
        }
    }

    console.log(msg.content);
}


if (discord_token && discord_token.length >= 0) {
    client.login(discord_token);
} else {
    throw "Invalid discord_token";
}