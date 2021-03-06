const { Collection, Client, MessageEmbed, MessageActionRow, MessageButton, Message, MessageSelectMenu } = require("discord.js");
const db = require("./database/db");
const logs = require("./logs");
const fs = require("fs");
const data = require("./data/data");
const wait = require("util").promisify(setTimeout);
const client = new Client({
    intents: ["GUILDS", "GUILD_MESSAGES"]
});

process.on("unhandledRejection", (err) => {
    logs.error("system", err.stack);
});

process.on("uncaughtException", (err) => {
    logs.error("system", err.stack);
});

function fetchMainGuild() {
    return client.guilds.cache.get(data.mainGuild);
}
/**
 * @param {string} id
 */
function fetchGuild(id) {
    return client.guilds.cache.get(id);
}

client.commands = new Collection();

const commandsDir = fs.readdirSync("commands").filter(f => f.endsWith(".js"));
let loadedCommands = 0;
for (const f of commandsDir) {
    try {
        const command = require(`./commands/${f}`);
        if (!command.name) {
            logs.error("bot", `Command file ${f} has no name property, so it won't be loaded`);
            continue;
        }
        if (!command.execute) {
            logs.error("bot", `Command file ${f} has no execute property, so it won't be loaded`);
            continue;
        }
        if (!command.aliases) logs.warn("bot", `Command file ${f} has no aliases property`);
        client.commands.set(command.name, command);
        loadedCommands += 1;
    }
    catch (err) {
        logs.error('bot', `Couldn't load command file ${f} due to an unknown error\n${err.stack}`);
    }
}

client.on("ready", async () => {
    logs.success('bot', 'Successfully connected to discord');
    logs.info('bot', `Loaded ${loadedCommands}/${commandsDir.length} commands`);
});

client.on("messageCreate", async message => {
    if (!message.guild || message.author.bot) return;
    let prefix;
    const foundPrefix = await db.query("SELECT * FROM prefixes WHERE prefixes.guildId = ?", [message.guild.id]);
    if (foundPrefix[0]) {
        prefix = foundPrefix[0].prefix;
    }
    else prefix = data.defaultPrefix;
    client.prefix = prefix;
    const blacklist = await db.query("SELECT * FROM blacklist");
    /**
     * @returns {Promise<Message>}
     */
    async function getInput() {
        const filter = m => m.author.id === message.author.id;
        const collected = await message.channel.awaitMessages({ filter, max: 1 });
        return collected.first();
    }
    /**
     * @param {string | object} content
     * @returns {Promise<Message>}
     */
    async function reply(content) {
        if (typeof content === "object") {
            content.allowedMentions = { repliedUser: false };
        }
        else if (typeof content === "string") {
            content = { content, allowedMentions: { repliedUser: false } }
        }
        return await message.reply(content).catch(err => {
            logs.error("bot", err.stack);
            try {
                message.channel.send(content);
            }
            catch (err2) {
                logs.error('bot', err2.stack);
            }
        });
    }
    if (message.content.toLowerCase().startsWith(`<@${client.user.id}>`) || message.content.toLowerCase().startsWith(`<@!${client.user.id}>`)) {
        const foundLang = await db.query("SELECT * FROM langs WHERE langs.id = ?", [message.author.id]);
        const lang = foundLang[0] ? foundLang[0].lang : "es";
        const text = {
            es: `Mi prefijo en este servidor es **${prefix}**\n\nPara ver mis comandos usa el comando \`${prefix}comandos\`\n\nPara obtener info del bot usa el comando \`${prefix}ayuda\`\n\nSi deseas obtener informaci??n de un comando concreto, usa \`${prefix}comando {comando}\``,
            en: `My prefix on this server is **${prefix}**\n\nTo see my commands use the command \`${prefix}commands\`\n\nTo get bot's info use the command ${prefix}help\n\nIf you wish to get info of an specific command, use the command \`${prefix}command {command}\``
        }
        return reply(text[lang]);
    }
    if (!message.content.toLowerCase().startsWith(prefix)) return;
    if (blacklist.find(u => u.userId === message.author.id)) return message.react("???");
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd === "" || cmd === " ") return;
    const foundCmd = client.commands.get(cmd) ?? client.commands.find(c => {
        if (c.aliases) {
            if (c.aliases.includes(cmd)) return true;
            else return false;
        }
        else return false;
    });
    const foundStaff = await db.query("SELECT * FROM staffs WHERE staffs.id = ?", [message.author.id]);
    if (!foundCmd || foundCmd && foundCmd.category === "staff" && !foundStaff[0] || foundStaff[0] && foundStaff[0].rank < foundCmd.minRank) return reply("```\n" + `${prefix}${cmd}\n${createSpaces(prefix.length)}${createArrows(cmd.length)}\n\nERR: Unknown command` + "\n```");
    try {
        foundCmd.execute(message, args, reply, getInput, cmd);
    }
    catch (err) {
        logs.error(`Error while executing command ${foundCmd.name}\n${err.stack}`);
        reply("An unexpected error ocurred");
    }
});

client.on("interactionCreate", async interaction => {
    const foundLang = await db.query("SELECT * FROM langs WHERE langs.id = ?", [interaction.user.id]);
    const lang = foundLang[0] ? foundLang[0].lang : "es";
    const foundStaff = await db.query("SELECT * FROM staffs WHERE staffs.id = ?", [interaction.user.id]);
    if (interaction.isSelectMenu()) {
        if (interaction.customId.startsWith("commands-menu")) {
            if (!interaction.guild) return;
            const authorId = interaction.customId.slice("commands-menu-".length);
            const deniedResponses = {
                es: "No puedes modificar el menu de otro usuario",
                en: "You cannot modify the menu of another user"
            }
            if (authorId !== interaction.user.id) return interaction.reply({ content: deniedResponses[lang], ephemeral: true });
            let prefix;
            const foundPrefix = await db.query("SELECT * FROM prefixes WHERE prefixes.guildId = ?", [interaction.guild.id]);
            if (foundPrefix[0]) prefix = foundPrefix[0].prefix;
            else prefix = data.defaultPrefix;
            const user = interaction.user;
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
                    es: "Protecci??n",
                    en: "Protection"
                },
                config: {
                    es: "Configuraci??n",
                    en: "Configuration"
                },
                mod: {
                    es: "Moderaci??n",
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
                    es: "Selecciona una secci??n...",
                    en: "Select a section..."
                }
            }
            const mainEmbed = new MessageEmbed()
                .setTitle("Safeness")
                .setDescription(texts.desc[lang])
                .addField(texts.instruction.title[lang], texts.instruction[lang])
                .setColor("GREEN")
            const commands = {
                protection: client.commands.filter(c => c.category === "protection"),
                config: client.commands.filter(c => c.category === "configuration"),
                mod: client.commands.filter(c => c.category === "moderation"),
                others: client.commands.filter(c => c.category === "others"),
                agents: client.commands.filter(c => c.category === "agents"),
                premium: client.commands.filter(c => c.category === "premium")
            }
            const embeds = {
                protection: new MessageEmbed()
                    .setTitle(texts.protection[lang])
                    .setDescription(commands.protection.size > 0 ? commands.protection.map(cmd => `**${prefix}${cmd.name}** - ${cmd.description[lang]}`).join("\n\n") : "none")
                    .setColor("GREEN"),
                config: new MessageEmbed()
                    .setTitle(texts.config[lang])
                    .setDescription(commands.config.size > 0 ? commands.config.map(cmd => `**${prefix}${cmd.name}** - ${cmd.description[lang]}`).join("\n\n") : "none")
                    .setColor("GREEN"),
                main: mainEmbed,
                mod: new MessageEmbed()
                    .setTitle(texts.mod[lang])
                    .setDescription(commands.mod.size > 0 ? commands.mod.map(cmd => `**${prefix}${cmd.name}** - ${cmd.description[lang]}`).join("\n\n") : "none")
                    .setColor("GREEN"),
                others: new MessageEmbed()
                    .setTitle(texts.others[lang])
                    .setDescription(commands.others.size > 0 ? commands.others.map(cmd => `**${prefix}${cmd.name}** - ${cmd.description[lang]}`).join("\n\n") : "none")
                    .setColor("GREEN"),
                agents: new MessageEmbed()
                    .setTitle(texts.agents[lang])
                    .setDescription(commands.agents.size > 0 ? commands.agents.map(cmd => `**${prefix}${cmd.name}** - ${cmd.description[lang]}`).join("\n\n") : "none")
                    .setColor("GREEN"),
                premium: new MessageEmbed()
                    .setTitle("Premium")
                    .setDescription(commands.premium.size > 0 ? commands.premium.map(cmd => `**${prefix}${cmd.name}** - ${cmd.description[lang]}`).join("\n\n") : "none")
                    .setColor("YELLOW")
            }
            await interaction.deferUpdate();
            interaction.message.edit({ embeds: [embeds[interaction.values[0]]] });
        }
    }
    else if (interaction.isButton()) {
        if (interaction.customId.startsWith("execute-command")) {
            let data = interaction.customId.slice("execute-command".length).trim().split("-");
            data.shift();
            const commandName = data[0];
            const authorId = data[1];
            const messageId = data[2];
            const deniedResponses = {
                es: "No puedes ejecutar el comando de otro usuario",
                en: "You cannot execute the command of another user"
            }
            const texts = {
                askArgs: {
                    es: "Introduce los argumentos que van a ser pasados al comando",
                    en: "Enter the arguments that will be passed to the command"
                }
            }
            if (interaction.user.id !== authorId) return interaction.reply({ content: deniedResponses[lang], ephemeral: true });
            await interaction.deferReply({ ephemeral: false });
            const command = client.commands.get(commandName);
            /**
             * @returns {Promise<Message>}
             */
            async function getInput() {
                const filter = m => m.author.id === interaction.user.id;
                const collected = await interaction.channel.awaitMessages({ filter, max: 1 });
                return collected.first();
            }
            await interaction.editReply(texts.askArgs[lang]);
            const repli = await interaction.fetchReply();
            const msg = await getInput();
            const args = msg.content.trim().split(/ +/g);
            await interaction.message.delete();
            await repli.delete();
            await interaction.channel.messages.fetch();
            await interaction.channel.messages.cache.get(messageId).delete();
            /**
             * @param {string | object} content
             * @returns {Promise<Message>}
             */
            async function reply(content) {
                if (typeof content === "object") {
                    content.allowedMentions = { repliedUser: false };
                }
                else if (typeof content === "string") {
                    content = { content, allowedMentions: { repliedUser: false } }
                }
                return await msg.reply(content).catch(err => {
                    logs.error("bot", err.stack);
                    try {
                        msg.channel.send(content);
                    }
                    catch (err2) {
                        logs.error('bot', err2.stack);
                    }
                });
            }
            await command.execute(msg, args, reply, getInput, command.name);
        }
        else if (interaction.customId.startsWith("remove-warn")) {
            const data = interaction.customId.slice("remove-warn-".length).trim().split("-");
            const authorId = data[1];
            const targetId = data[0];
            const deniedResponses = {
                es: "No puedes usar la interacci??n de otro usuario",
                en: "You cannot use the interaction of another user"
            }
            const texts = {
                askId: {
                    es: "Introduce la ID de la advertencia que deseas remover",
                    en: "Enter the ID of the warning u wish to remove"
                },
                errors: {
                    notWhole: {
                        es: "La ID debe ser un n??mero entero",
                        en: "The ID must be a whole number"
                    },
                    notNumber: {
                        es: "La ID debe ser un n??mero",
                        en: "The ID must be a number"
                    },
                    noPerms: {
                        es: "No tienes permisos para esto",
                        en: "You don't have permissions for this"
                    }
                }
            }
            if (interaction.user.id !== authorId) return interaction.reply({ ephemeral: true, content: deniedResponses[lang] });
            if (!interaction.member.permissions.has("MODERATE_MEMBERS")) return interaction.reply({ ephemeral: true, content: texts.errors.noPerms[lang] });
            await client.users.fetch(targetId);
            if (!interaction.guild.members.cache.has(targetId)) return interaction.reply({ ephemeral: true, content: "ERR: Member not found" });
            await interaction.deferReply({ ephemeral: false });
            /**
             * @returns {Promise<Message>}
             */
            async function getInput() {
                const filter = m => m.author.id === interaction.user.id;
                const collected = await interaction.channel.awaitMessages({ filter, max: 1 });
                return collected.first();
            }
            await interaction.editReply(texts.askId[lang]);
            const repli = await interaction.fetchReply();
            let id = await getInput();
            if (isNaN(id.content)) {
                await id.delete();
                repli.edit(texts.errors.notNumber[lang]);
                await wait(3000);
                return repli.delete();
            }
            if (!Number.isInteger(Number(id.content))) {
                await id.delete();
                repli.edit(texts.errors.notWhole[lang]);
                await wait(3000);
                return repli.delete();
            }
            await id.delete();
            id = Number(id.content);
            const foundId = await db.query("SELECT * FROM warnings WHERE warnings.id = ?", [id]);
            if (!foundId[0]) {
                repli.edit("ERR: Invalid ID");
                await wait(3000);
                return repli.delete();
            }
            if (foundId[0].userId !== targetId) {
                repli.edit("ERR: Invalid ID");
                await wait(3000);
                return repli.delete();
            }
            await db.query("DELETE FROM warnings WHERE warnings.id = ?", [id]);
            await repli.edit("????");
            await wait(3000);
            repli.delete();
            interaction.message.delete();
        }
        else if (interaction.customId.startsWith("confirm-staff")) {
            const idata = interaction.customId.slice("confirm-staff-".length).trim().split("-");
            const targetId = idata[0];
            const rankId = idata[1];
            const authorId = idata[2];
            if (!foundStaff[0]) return interaction.reply({ ephemeral: true, content: "401 - Not authorized" });
            if (authorId !== interaction.user.id) return interaction.reply({ ephemeral: true, content: "No puedes aceptar o rechazar por otro staff." });
            await interaction.deferReply();
            const role = await fetchMainGuild().roles.fetch(data.ranks[rankId].role_id);
            const m = await fetchMainGuild().members.fetch(targetId);
            await db.query("INSERT INTO staffs SET ?", [{ id: m.user.id, rank: Number(rankId) }]);
            await m.roles.add(role);
            await interaction.editReply("Nuevo staff registrado");
            await interaction.message.delete();
        }
        else if (interaction.customId.startsWith("deciline-staff")) {
            const idata = interaction.customId.slice("deciline-staff-".length).trim().split("-");
            const authorId = idata[1];
            if (!foundStaff[0]) return interaction.reply({ ephemeral: true, content: "401 - Not authorized" });
            if (authorId !== interaction.user.id) return interaction.reply({ ephemeral: true, content: "No puedes aceptar o rechazar por otro staff." });
            await interaction.reply("Comando cancelado.");
            await interaction.message.delete();
        }
    }
});
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

client.login(data.token);