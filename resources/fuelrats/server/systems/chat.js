/// <reference types="@altv/types-server" />
import alt from 'alt-server';

let commands = {};

alt.onClient('chat:Send', chatSend);
alt.on('chat:Send', chatSend);

/**
 * Register commands for players to use.
 * @param  {string} commandName
 * @param  {string} description
 * @param  {Function} callback
 */
export function registerCmd(commandNames, description, callback) {
    for (let i = 0; i < commandNames.length; i++) {
        const commandName = commandNames[i].toLowerCase();
        if (commands[commandName]) {
            continue;
        }

        commands[commandName] = {
            callback,
            description
        };
    }
}

function invokeCmd(player, commandName, args) {
    commandName = commandName.toLowerCase();
    if (!commands[commandName]) {
        player.send(`{FF0000} Unknown command /${commandName}`);
        return;
    }

    const callback = commands[commandName].callback;
    if (typeof callback !== 'function') {
        player.send(`{FF0000} Unknown command /${commandName}`);
        return;
    }

    callback(player, args);
}

function chatSend(player, msg) {
    if (msg[0] === '/') {
        alt.log(`[Command] ${player.name} ${msg}`);
        msg = msg.trim().slice(1);

        if (msg.length > 0) {
            let args = msg.split(' ');
            let commandName = args.shift();
            invokeCmd(player, commandName, args);
        }
        return;
    }

    msg = msg.trim();
    if (msg.length <= 0) {
        return;
    }

    let actualName = '';

    if (player) {
        const actualName = player.getSyncedMeta('NAME');
        alt.log(`[Message] ${actualName}: ${msg}`);

        // Cleanse Message
        msg = msg
            .replace(/</g, '&lt;')
            .replace(/'/g, '&#39')
            .replace(/"/g, '&#34');

        alt.emitClient(null, 'chat:Send', `${actualName} says: ${msg}`);
        return;
    }

    alt.emitClient(null, 'chat:Send', msg);
}
