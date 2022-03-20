const { Message, MessageEmbed } = require("discord.js");
const db = require("../database/db");
const os = require("os");
const moment = require('moment');
const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100}`;
require('moment-duration-format');
module.exports = {
    name: "botinfo",
    description: {
        es: "Muestra info del bot",
        en: "Shows bot's info"
    },
    aliases: ["bot", "stats", "bot-info", "info-bot", "info"],
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {function} reply 
     * @param {function} getInput 
     */
    execute: async function (message, args, reply, getInput) {
        const texts = {
            title: {
                es: "Info general",
                en: "General info"
            },
            ram: {
                es: "Ram en uso",
                en: "Ram used"
            },
            upt: {
                es: "Tiempo de actividad",
                en: "Activity time"
            },
            usrs: {
                es: "Usuarios",
                en: "Users"
            },
            cachedU: {
                es: "Usuarios cacheados",
                en: "Cached users"
            },
            channels: {
                es: "Canales",
                en: "Channels"
            },
            servers: {
                es: "Servidores",
                en: "Servers"
            }
        }
        let loadingmsg = await reply(`Loading...`);
        const foundLang = await db.query("SELECT * FROM langs WHERE langs.id = ?", [message.author.id]);
        const lang = foundLang[0] ? foundLang[0].lang : "es";
        const totalUsers = message.client.guilds.cache.size > 1 ? message.client.guilds.cache.reduce((a, b) => a.memberCount + b.memberCount) : message.client.guilds.cache.first().memberCount;
        const memoryUsage = `${formatMemoryUsage(process.memoryUsage().heapUsed)} MB / ${formatMemoryUsage(os.totalmem())} MB`;
        const uptime = moment.duration(message.client.uptime).format(' D [days], H [hrs], m [mins], s [secs]');
        const embed = new MessageEmbed()
        .setTitle(texts.title[lang])
        .addField(`General:`, `
                **:bust_in_silhouette:${texts.cachedU[lang]}:** ${message.client.users.cache.size}
                **:level_slider:${texts.channels[lang]}:** ${message.client.channels.cache.size}
                **:computer:${texts.servers[lang]}:** ${message.client.guilds.cache.size}
                **:busts_in_silhouette:${texts.usrs[lang]}:** ${totalUsers}
                **:floppy_disk:${texts.ram[lang]}:** ${memoryUsage}
                **:clock1:${texts.upt[lang]}:** ${uptime}
                `
        )
        .setColor("GREEN")
        await loadingmsg.delete();
        await reply({ embeds: [embed] });
    }
}