const db = require("../database/db");
const { MessageEmbed, Message, GuildMember } = require("discord.js");
module.exports = {
    name: "ban",
    description: {
        es: "Banea a un usuario",
        en: "Bans a user"
    },
    aliases: ["banear"],
    category: "moderation",
    /**
     * @param {Message} message
     * @param {Array<String>} args
     * @param {function} reply
     * @param {function} getInput
     * @param {string} aliase
     */
    execute: async (message, args, reply, getInput, aliase) => {
        const foundLang = db.query("SELECT * FROM langs WHERE langs.id = ?", [message.author.id]);
        const lang = foundLang ? foundLang[0].lang : "es";
        const { guild, member, author, client, channel } = message;
        /**
         * @param {number} length
         * @returns {string}
         */
        function createSpaces(length) {
            let spaces = "";
            for (let i = 0; i < length; i++) {
                spaces += " ";
            }
            return spaces;
        }
        /**
         * @param {number} length
         * @returns {string}
         */
        function createArrows(length) {
            let arrows = "";
            for (let i = 0; i < length; i++) {
                arrows += ">";
            }
            return arrows;
        }
        const done = {
            es: ":white_check_mark: | Hecho",
            en: ":white_check_mark: | Done"
        }
        if (!member.permissions.has("BAN_MEMBERS")) {
            return reply("```\n" + `${client.prefix}${aliase}\n${createSpaces(`${client.prefix}`.length)}${createArrows(aliase.length)}\n\nERR: Missing permissions` + "\n```");
        }
        const target = message.mentions.members.first() || args[0];
        if (!target) {
            return reply("```\n" + `${client.prefix}${aliase} {Target} {Reason}\n${createSpaces(`${client.prefix} {`.length)}${createArrows("target".length)}\n\nERR: Missing target` + "\n```");
        }
        const reason = args.slice(1).join(" ");
        if (!reason) {
            return reply("```\n" + `${client.prefix}${aliase} {Target} {Reason}\n${createSpaces(`${client.prefix}${aliase} {Target} {`.length)}${createArrows("reason".length)}\n\nERR: Missing reason` + "\n```");
        }
        if (target instanceof GuildMember) {
            target.ban(reason).then(() => {
                channel.send(`${author} ${done[lang]}`);
            }).catch(err => {
                channel.send(`${author} ${done[lang]}`);
            });
        }
        else if (!isNaN(target)) {
            await guild.members.fetch();
            const foundUser = await guild.members.fetch(target);
            if (!foundUser) {
                return reply("```\n" + `${client.prefix}${aliase} ${target} ${reason}\n${createSpaces(`${client.prefix}${aliase} `.length)}${createArrows(target.length)}\n\nERR: Unknown user` + "\n```");
            }
            foundUser.ban(reason).then(() => {
                channel.send(`${author} ${done[lang]}`);
            }).catch(err => {
                channel.send(`${author} ${done[lang]}`);
            });
        }
        else {
            return reply("```\n" + `${client.prefix}${aliase} {Target} {Reason}\n${createSpaces(`${client.prefix}${aliase} `.length)}${createArrows("target".length)}\n\nERR: Invalid target format` + "\n```");
        }
    }
}