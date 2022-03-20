const { Message } = require("discord.js");
const data = require("../data/data");
const db = require("../database/db");
module.exports = {
    name: "setprefix",
    description: {
        es: "Cambia el prefijo del servidor",
        en: "Changes the server's prefix"
    },
    category: "configuration",
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {function} reply 
     * @param {function} getInput 
     */
    execute: async function(message, args, reply, getInput) {
        const done = {
            es: "Prefijo establecido",
            en: "Prefix established"
        }
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
        const { author, guild, channel, member, client } = message;
        const foundLang = await db.query("SELECT * FROM langs WHERE langs.id = ?", [author.id]);
        const lang = foundLang[0] ? foundLang[0].lang : "es";
        if (!member.permissions.has("MANAGE_GUILD")) return reply("```\n" + `${client.prefix}setprefix\n${createSpaces(client.prefix.length)}^^^^^^^^^\n\nERR: Missing permissions` + "\n```");
        let lastPrefix = await db.query("SELECT * FROM prefixes WHERE prefixes.guildId = ?", [guild.id]);
        lastPrefix = lastPrefix[0] ? lastPrefix[0].prefix : data.defaultPrefix;
        const newPrefix = args[0];
        if (!newPrefix) return reply("```\n" + `${client.prefix}setprefix {prefix}\n${createSpaces(client.prefix.length)}           ${createArrows("prefix".length)}\n\nERR: Missing parameter` + "\n```");
        if (newPrefix === lastPrefix) return reply("```\n" + `${client.prefix}setprefix ${newPrefix}\n${createSpaces(`${client.prefix}setprefix`.length + 1)}${createArrows(newPrefix.length)}\n\nERR: Cannot set same prefix` + "\n```");
        if (newPrefix.length > 4) return reply("```\n" + `${client.prefix}setprefix ${newPrefix}\n${createSpaces(`${client.prefix}setprefix`.length + 1)}${createArrows(newPrefix.length)}\n\nERR: New prefix exceeds the 4 characters limit` + "\n```");
        const prefixExists = await db.query("SELECT * FROM prefixes WHERE prefixes.guildId = ?", [guild.id]);
        if (prefixExists[0]) {
            if (newPrefix === data.defaultPrefix) {
                await db.query("DELETE FROM prefixes WHERE prefixes.guildId = ?", [guild.id]);
            }
            else await db.query("UPDATE prefixes SET ? WHERE prefixes.guildId = ?", [{ prefix: newPrefix }, guild.id]);
        }
        else {
            await db.query("INSERT INTO prefixes SET ?", [{ guildId: guild.id, prefix: newPrefix }]);
        }
        reply(done[lang]);
    }
}