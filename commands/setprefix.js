const { Message } = require("discord.js");
const data = require("../data/data");
const db = require("../database/db");
module.exports = {
    name: "setprefix",
    description: {
        es: "Sirve para cambiar el prefijo del servidor",
        en: "Used to change the server's prefix"
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
        const responses = {
            noPerms: {
                es: "No tienes permisos para ejecutar este comando",
                en: "You don't have permissions to execute this command"
            },
            samePrefixError: {
                es: "No puedes establecer el mismo prefijo",
                en: "You cannot establish the same prefix"
            },
            lengthError: {
                es: "El prefix no puede tener más de 4 caracteres",
                en: "The prefix cannot have more than 4 characters"
            },
            noPrefix: {
                es: "Debes introducir el nuevo prefijo",
                en: "You must enter the new prefix"
            },
            done: {
                es: "Prefijo establecido",
                en: "Prefix established"
            }
        }
        const { author, guild, channel, member, client } = message;
        const foundLang = await db.query("SELECT * FROM langs WHERE langs.id = ?", [author.id]);
        const lang = foundLang[0] ? foundLang[0].lang : "es";
        if (!member.permissions.has("MANAGE_GUILD")) return reply(responses.noPerms[lang]);
        let lastPrefix = await db.query("SELECT * FROM prefixes WHERE prefixes.guildId = ?", [guild.id]);
        lastPrefix = lastPrefix[0] ? lastPrefix[0].prefix : data.defaultPrefix;
        const newPrefix = args[0];
        if (!newPrefix) return reply(responses.noPrefix[lang]);
        if (newPrefix === lastPrefix) return reply(responses.samePrefixError[lang]);
        if (newPrefix.length > 4) return reply(responses.lengthError[lang]);
        const prefixExists = await db.query("SELECT * FROM prefixes WHERE prefixes.guildId = ?", [guild.id]);
        if (prefixExists[0]) {
            await db.query("UPDATE prefixes SET ? WHERE prefixes.guildId = ?", [{ prefix: newPrefix }, guild.id]);
        }
        else {
            await db.query("INSERT INTO prefixes SET ?", [{ guildId: guild.id, prefix: newPrefix }]);
        }
        reply(responses.done[lang]);
    }
}