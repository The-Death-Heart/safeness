const { Message, MessageEmbed, MessageActionRow } = require("discord.js");
const data = require("../data/data");
const db = require("../database/db");
const logs = require("../logs");
module.exports = {
    name: "blackadd",
    description: "Agrega un usuario a la lista negra",
    category: "staff",
    minRank: 2,
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {function} reply 
     * @param {function} getInput 
     */
    execute: async function (message, args, reply, getInput) {
        /**
         * 
         * @param {number} length 
         * @returns 
         */
         function createSpaces(length) {
            let spaces = "";
            for (let i = 0; i < length; i++) {
                spaces += " ";
            }
            return spaces;
        }
        /**
         * 
         * @param {number} length 
         * @returns 
         */
        function createArrows(length) {
            let arrows = "";
            for (let i = 0; i< length; i++) {
                arrows += "^";
            }
            return arrows;
        }
        const { author, member, channel, guild, client } = message;
        const foundLang = await db.query("SELECT * FROM langs WHERE langs.id = ?", [author.id]);
        const lang = foundLang[0] ? foundLang[0].lang : "es";
        let target = args[0];
        if (!target) return reply("```\n" + `${client.prefix}blackadd {userId}\n${createSpaces(`${client.prefix}blackadd {`.length)}${createArrows("userId".length)}\n\nERR: Missing parameter` + "\n```");
        let exists = false;
        try {
            await client.users.fetch(target);
            exists = true;
        }
        catch (err) {
            logs.error("bot", err.stack);
        }
        if (!exists) return reply("```\n" + `${client.prefix}blackadd ${target}\n${createSpaces(`${client.prefix}blackadd `.length)}${createArrows(target.length)}\n\nERR: Unknown user` + "\n```");
        const foundU = await db.query("SELECT * FROM blacklist WHERE blacklist.userId = ?", [target]);
        if (foundU[0]) return reply("```\n" + `${client.prefix}blackadd ${target}\n${createSpaces(`${client.prefix}blackadd `.length)}${createArrows(target.length)}\n\nERR: Cannot add a user twice` + "\n```");
        await db.query("INSERT INTO blacklist SET ?", [{ userId: target }]);
        await message.react('👍');
    }
}