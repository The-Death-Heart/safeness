const { Message, MessageEmbed, MessageButton, MessageActionRow, GuildMember } = require("discord.js");
const db = require("../database/db");
const logs = require("../logs");
module.exports = {
    name: "warn",
    description: {
        es: "Envia una advertencia a un usuario especifico",
        en: "Sends a warning to an specific user"
    },
    category: "moderation",
    aliases: ["advertir", "send-warning", "enviar-advertencia", "advertencia"],
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {function} reply 
     * @param {function} getInput 
     */
    execute: async function (message, args, reply, getInput, aliase) {
        const done = {
            es: "Usuario advertido",
            en: "User warned"
        }
        const foundLang = await db.query("SELECT * FROM langs WHERE langs.id = ?", [message.author.id]);
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
        const { author, guild, member, channel, client } = message;
        if (!member.permissions.has("MODERATE_MEMBERS")) return reply("```\n" + `${client.prefix}${aliase} {member} {reason}\n${createSpaces(`${client.prefix}`.length)}${createArrows(aliase.length)}\n\nERR: Missing permissions` + "\n```");
        let m = message.mentions.members.size > 0 ? message.mentions.members.first() : args[0];
        if (!m) return reply("```\n" + `${client.prefix}${aliase} {member} {reason}\n${createSpaces(`${client.prefix}${aliase} {`.length)}${createArrows("member".length)}\n\nERR: Missing parameter` + "\n```");
        const reason = args[1] ? args.slice(1).join(" ") : "No reason";
        if (m instanceof GuildMember) {
            let dmable = false;
            try {
                let msg = await m.user.send(".");
                dmable = true;
                await msg.delete();
            }
            catch (err) {
                logs.error("bot", err.stack);
            }
            await db.query("INSERT INTO warnings SET ?", [{ userId: m.user.id, guildId: m.guild.id, reason, modId: author.id }]);
            if (dmable) {
                const totalWarnings = await db.query("SELECT * FROM warnings WHERE warnings.userId = ? AND warnings.guildId = ?", [m.user.id, guild.id]);
                await m.send("```\n" + `warning\n${createArrows('warning'.length)}\n\nReason: ${reason}\nWarnings: ${totalWarnings.length}` + "\n```");
            }
        }
        else {
            if (!isNaN(m)) {
                try {
                    await guild.members.fetch(m);
                }
                catch (err) {
                    logs.error("bot", err.message);
                }
                if (!guild.members.cache.has(m)) return reply("```\n" + `${client.prefix}${aliase} ${m}\n${createSpaces(`${client.prefix}${aliase} `.length)}${createArrows(m.length)}\n\nERR: Unknown member` + "\n```");
                m = guild.members.cache.get(m);
                let dmable = false;
                try {
                    let msg = await m.user.send(".");
                    dmable = true;
                    await msg.delete();
                }
                catch (err) {
                    logs.error("bot", err.message);
                }
                await db.query("INSERT INTO warnings SET ?", [{ userId: m.user.id, guildId: m.guild.id, reason, modId: author.id }]);
                if (dmable) {
                    const totalWarnings = await db.query("SELECT * FROM warnings WHERE warnings.userId = ? AND warnings.guildId = ?", [m.user.id, guild.id]);
                    await m.send("```\n" + `warning\n${createArrows('warning'.length)}\n\nReason: ${reason}\nWarnings: ${totalWarnings.length}` + "\n```");
                }
            }
            else {
                m = guild.members.cache.find(mem => {
                    if (mem.user.username === m || mem.user.username.toLowerCase().includes(m)) return true;
                    else if (mem.nickname) {
                        if (mem.nickname === m || mem.nickname.toLowerCase().includes(m)) return true;
                        else return false;
                    }
                    else return false;
                });
                if (!m) {
                    m = args[0];
                    return reply("```\n" + `${client.prefix}${aliase} ${m}\n${createSpaces(`${client.prefix}${aliase} `.length)}${createArrows(m.length)}\n\nERR: Unknown member` + "\n```");
                }
                let dmable = false;
                try {
                    let msg = await m.user.send(".");
                    dmable = true;
                    await msg.delete();
                }
                catch (err) {
                    logs.error("bot", err.stack);
                }
                await db.query("INSERT INTO warnings SET ?", [{ userId: m.user.id, guildId: m.guild.id, reason, modId: author.id }]);
                if (dmable) {
                    const totalWarnings = await db.query("SELECT * FROM warnings WHERE warnings.userId = ? AND warnings.guildId = ?", [m.user.id, guild.id]);
                    await m.send("```\n" + `warning\n${createArrows('warning'.length)}\n\nReason: ${reason}\nWarnings: ${totalWarnings.length}` + "\n```");
                }
            }
        }
        await reply(done[lang])
    }
}