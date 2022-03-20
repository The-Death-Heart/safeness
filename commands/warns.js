const { Message, MessageEmbed, MessageActionRow, MessageButton, GuildMember } = require("discord.js");
const fs = require("fs");
const db = require("../database/db");
module.exports = {
    name: "warns",
    description: {
        es: "Muestra las advertencias de un usuario",
        en: "Shows an user's warnings"
    },
    category: "moderation",
    aliases: ["advertencias", "view-warns", "warnings", "ver-advertencias", "view-warnings"],
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {function} reply 
     * @param {function} getInput 
     */
    execute: async function (message, args, reply, getInput, aliase) {
        const { author, guild, member, channel, client } = message;
        const foundLang = await db.query("SELECT * FROM langs WHERE langs.id = ?", [author.id]);
        const lang = foundLang[0] ? foundLang[0].lang : "es";
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
            for (let i = 0; i < length; i++) {
                arrows += "^";
            }
            return arrows;
        }
        const texts = {
            mod: {
                es: "Moderador / Administrador",
                en: "Moderator / Administrator"
            },
            reason: {
                es: "Motivo",
                en: "Reason"
            },
            title: {
                es: "Advertencias de",
                en: "Warnings of"
            },
            total: {
                es: "Advertencias totales",
                en: "Total warnings"
            },
            limitExceed: {
                es: "Las advertencias superan la cantidad de 10, por lo que van a ser enviadas en un archivo .txt",
                en: "The warnings exceeds the limit (10 warnings) so they'll be sent in a .txt file"
            }
        }
        let m = message.mentions.members.first();
        if (!m) return reply("```\n" + `${client.prefix}${aliase} {GuildMember}\n${createSpaces(`${client.prefix}${aliase} {`.length)}${createArrows("GuildMember".length)}\n\nERR: Missing parameter` + "\n```");
        const warnings = await db.query("SELECT * FROM warnings WHERE warnings.userId = ? AND warnings.guildId = ?", [m.user.id, guild.id]);
        if (warnings.length > 10) {
            const path = "../warnings.txt";
            fs.writeFileSync(path, `--------- ${texts.title[lang]} ${m.nickname ? m.nickname : m.user.username} ---------\n${texts.total[lang]}: ${warnings.length}\n\n${warnings.map(w => `${texts.mod[lang]}: ${guild.members.cache.has(w.modId) ? guild.members.cache.get(w.modId).tag : "Unknown"}\n${texts.reason[lang]}: ${w.reason}`).join("\n---------\n")}`);
            return reply({ content: texts.limitExceed[lang], files: [path] });
        }
        let warningsEmbed = new MessageEmbed()
        .setTitle(`${texts.title[lang]} ${m.nickname ? m.nickname : m.user.username}`)
        .setDescription(`${warnings.length > 0 ? warnings.map(w => `${texts.mod[lang]}: ${guild.members.cache.has(w.modId) ? guild.members.cache.get(w.modId) : "Unknown"}\n${texts.reason[lang]}: ${w.reason}`).join("\n---------\n") : "none"}\n\n${texts.total[lang]}: ${warnings.length}`)
        .setColor("GREEN")
        .setTimestamp()
        reply({ embeds: [warningsEmbed] });
    }
}