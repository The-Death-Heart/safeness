const { Message, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const data = require("../data/data");
const db = require("../database/db");
module.exports = {
    name: "command",
    description: {
        es: "Visualiza la info de un comando",
        en: "See a command's info"
    },
    aliases: ["comando"],
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {function} reply 
     * @param {function} getInput 
     * @returns 
     */
    execute: async function (message, args, reply, getInput, aliase) {
        const client = message.client;
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
            for (let i = 0; i< length; i++) {
                arrows += "^";
            }
            return arrows;
        }
        const texts = {
            aliasesText: {
                es: "Apodos",
                en: "Aliases"
            },
            desc: {
                es: "Descripción",
                en: "Description"
            },
            exec: {
                es: "Ejecutar",
                en: "Execute"
            }
        }
        let cmd = args[0]
        if (!cmd) return reply("```\n" + `${client.prefix}${aliase} {command}\n${createSpaces(`${client.prefix}${aliase} {`.length)}${createArrows("command".length)}\n\nERR: Missing parameter` + "\n```");
        const foundCmd = client.commands.get(cmd) ?? client.commands.find(c => {
            if (c.aliases) {
                if (c.aliases.includes(cmd.toLowerCase())) return true;
                else return false;
            }
            else return false;
        });
        if (!foundCmd) return reply("```\n" + `${client.prefix}${aliase} ${cmd}\n${createSpaces(`${client.prefix}${aliase} `.length)}${createArrows(cmd.length)}\n\nERR: Unknown command` + "\n```");
        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId(`execute-command-${foundCmd.name}-${message.author.id}-${message.id}`)
            .setLabel(texts.exec[lang])
            .setStyle("PRIMARY")
        );
        const aliases = foundCmd.aliases ?? [];
        const embed = new MessageEmbed()
        .setTitle(foundCmd.name)
        .addFields(
            {
                name: texts.desc[lang],
                value: foundCmd.description[lang]
            },
            {
                name: texts.aliasesText[lang],
                value: aliases.length > 0 ? aliases.join(", ") : "none"
            }
        )
        .setColor("GREEN")
        .setTimestamp()
        await reply({ embeds: [embed], components: [row] });
    }
}