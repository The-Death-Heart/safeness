const { Message, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const data = require("../data/data");
const db = require("../database/db");
module.exports = {
    name: "addstaff",
    description: {
        es: "Registra un nuevo staff",
        en: "Register a new staff"
    },
    minRank: 4,
    category: "staff",
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
        const { author, member, guild, channel, client } = message;
        const target = args[0];
        const rank = args[1];
        if (!target) return reply("```\n" + `${client.prefix}addstaff {userId} {rankId}\n${createSpaces(`${client.prefix}addstaff {`.length)}${createArrows("userId".length)}\n\nERR: Missing parameter` + "\n```");
        if (!rank) return reply("```\n" + `${client.prefix}addstaff ${target} {rankId}\n${createSpaces(`${client.prefix}addstaff ${target} {`.length)}${createArrows("rankId".length)}\n\nERR: Missing parameter` + "\n```");
        const availableRanks = [...Object.keys(data.ranks)];
        if (!availableRanks.some(r => r === rank)) return reply("```\n" + `${client.prefix}addstaff ${target} ${rank}\n${createSpaces(`${client.prefix}addstaff ${target} `.length)}${createArrows(rank.length)}\n\nERR: Unknown rank` + "\n```");
        let exists = false;
        try {
            await client.users.fetch(target);
            exists = true;
        }
        catch (err) {
            logs.error("bot", err.stack);
        }
        if (!exists) return reply("```\n" + `${client.prefix}addstaff ${target} ${rank}\n${createSpaces(`${client.prefix}addstaff `.length)}${createArrows(target.length)}\n\nERR: Unknown user` + "\n```");
        if (!client.guilds.cache.get(data.mainGuild).members.cache.has(target)) return reply(`Por motivos de seguridad, no puedo permitir el ingreso de \`${client.users.cache.get(target).username}\` debido a que no se encuentra en el servidor principal (${client.guilds.cache.get(data.mainGuild).name})`);
        const foundU = await db.query("SELECT * FROM staffs WHERE staffs.id = ?", [target]);
        if (foundU[0]) return reply("```\n" + `${client.prefix}addstaff ${target} ${rank}\n${createSpaces(`${client.prefix}addstaff `.length)}${createArrows(target.length)}\n\nERR: The user already is staff` + "\n```");
        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId(`confirm-staff-${target}-${rank}-${author.id}`)
            .setLabel("Confirmar")
            .setStyle("SUCCESS"),
            new MessageButton()
            .setCustomId(`deciline-staff-${target}-${author.id}`)
            .setLabel("Cancelar")
            .setStyle("DANGER")
        )
        await reply({ content: `Esta acción le dará a \`${client.users.cache.get(target).username}\` el rango staff de **${data.ranks[rank].name} (${data.ranks[rank].id})** \n¿Desea continuar?`, components: [row] });
    }
}