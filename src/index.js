import { Client } from 'discord.js';
import { token } from "./config.json";
import { BoosterDraft } from './draft.js';

const client = new Client();

/** @type Map.<string, Draft> */
let channelMap = new Map();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('disconnect', () => {
    console.log(`Client disconnected`);
});

client.on('message', msg => {
    if (msg.content === 'ping') {
        msg.reply('pong');
    }

    if (msg.content.startsWith("!")) {
        let commands = msg.content.substr(1).split(" ");
        switch(commands[0]) {
            case "startdraft": {
                let channelid = msg.channelid;
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
                        } break;
                        */

                        /*
                        case "sealed": {
                            draftObj = new SealedDraft();
                        } break;
                        */

                        case "booster":
                        default: {
                            draftObj = new BoosterDraft();
                            msg.channel.send(`${msg.author} started a Booster Draft! The packs will use the following sets:\n Round 1: [M19], Round 2: [M19], Round 3: [M19]\n Type \`!join\` to join. The creator can start the draft with \`!begindraft\`, or cancel it with \`!stopdraft\`.`);
                        } break;
                    }

                    channelMap.set(channelid, draftObj);
                } else {
                    msg.reply("There is already an active session. Use !stopdraft to cancel it.");
                }
            } break;

            case "begindraft": {

            } break;

            case "joindraft": {

            } break;

            case "stopdraft": {
                let channelid = msg.channelid;
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
});

client.login(token);