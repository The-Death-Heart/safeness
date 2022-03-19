const { Message, MessageActionRow, MessageSelectMenu, MessageButton, MessageEmbed } = require("discord.js");
const db = require("../database/db");
module.exports = {
    name: "help",
    description: {
        es: "Despliega este menu",
        en: "Displays this menu"
    },
    category: {
        es: "",
        en: ""
    },
    aliases: ["ayuda"],
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {function} reply 
     * @param {function} getInput 
     */
    execute: async function (message, args, reply, getInput) {
        const { author, channel, guild, client, member } = message;
        const foundLang = db.query("SELECT lang FROM langs WHERE langs.id = ?", [author.id]);
        const lang = foundLang.length > 0 ? foundLang[0] : "es";
        const texts = {
            desc: {
                es: `Safeness es un bot hecho para ayudarte a proteger y administrar tu servidor`,
                en: `Safeness is a bot made to help you to protect and manage your server`
            },
            instruction: {
                es: `Utiliza el menu de abajo para navegar por las secciones`,
                en: `Use the menu below to navigate through the sections`,
                title: {
                    es: "Instrucciones",
                    en: "Instructions"
                }
            },
            protection: {
                es: "Protección",
                en: "Protection"
            },
            config: {
                es: "Configuración",
                en: "Configuration"
            },
            mod: {
                es: "Moderación",
                en: "Moderation"
            },
            others: {
                es: "Otros",
                en: "Others"
            },
            agents: {
                es: "Agentes",
                en: "Agents"
            },
            placeholder: {
                es: "Selecciona una sección...",
                en: "Select a section..."
            }
        }
        const mainEmbed = new MessageEmbed()
            .setAuthor({ url: author.displayAvatarURL({ dynamic: true }), name: author.tag })
            .setTitle("Safeness")
            .setDescription(texts.desc[lang])
            .addField(texts.instruction.title[lang], texts.instruction[lang])
            .setColor("GREEN")
        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setOptions(
                        {
                            label: texts.protection[lang],
                            value: "protection"
                        },
                        {
                            label: texts.config[lang],
                            value: "config"
                        },
                        {
                            label: texts.mod[lang],
                            value: "mod"
                        },
                        {
                            label: texts.others[lang],
                            value: "others"
                        },
                        {
                            label: "Premium",
                            value: "premium,"
                        },
                        {
                            label: texts.agents[lang],
                            value: "agents"
                        }
                    )
                    .setCustomId(`help-menu-${author.id}`)
                    .setPlaceholder(texts.placeholder[lang])
            );
        await reply({ embeds: [mainEmbed], components: [row] });
    }
}