const { Collection, Client, MessageEmbed, MessageActionRow, MessageButton, Message } = require("discord.js");
const db = require("./database/db");
const logs = require("./logs");
const fs = require("fs");
const data = require("./data/data");
const client = new Client({
    intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES"]
});

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
            content = content.content;
            message.channel.send(content);
        });
    }
    if (!message.content.startsWith(prefix)) return;
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
    if (!foundCmd) return reply(`Comando no encontrado - command not found`);
    try {
        foundCmd.execute(message, args, reply, getInput);
    }
    catch (err) {
        logs.error(`Error while executing command ${foundCmd.name}\n${err.stack}`);
        reply("An unexpected error ocurred");
    }
});
client.login(data.token);